import {
    AssetContracts,
    AssetFolderContracts,
    AssetFolderModels,
    AssetModels,
    ContentItemContracts,
    ContentItemModels,
    ContentTypeContracts,
    ContentTypeElements,
    ContentTypeModels,
    ContentTypeSnippetContracts,
    LanguageContracts,
    LanguageModels,
    LanguageVariantContracts,
    LanguageVariantModels,
    ManagementClient,
    SharedModels,
    TaxonomyContracts,
    TaxonomyModels,
    WorkflowContracts,
    WorkflowModels
} from '@kontent-ai/management-sdk';
import { version, name } from '../../package.json';

import {
    idTranslateHelper,
    IImportItemResult,
    ActionType,
    translationHelper,
    ValidImportContract,
    ValidImportModel,
    handleError,
    defaultWorkflowCodename,
    defaultObjectId,
    defaultRetryStrategy,
    printProjectInfoToConsoleAsync
} from '../core';
import { IBinaryFile, IImportConfig, IImportSource } from './import.models';
import { HttpService } from '@kontent-ai/core-sdk';
import { yellow } from 'colors';

export class ImportService {
    private readonly defaultLanguageId: string = defaultObjectId;
    private readonly client: ManagementClient;

    /**
     * Maximum allowed size of asset in Bytes.
     * Currently 1e8 = 100 MB
     */
    private readonly maxAllowedAssetSizeInBytes: number = 1e8;

    constructor(private config: IImportConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            environmentId: config.environmentId,
            httpService: new HttpService({
                logErrorsToConsole: false
            }),
            retryStrategy: config.retryStrategy ?? defaultRetryStrategy
        });
    }

    public async importFromSourceAsync(
        sourceData: IImportSource
    ): Promise<IImportItemResult<ValidImportContract, ValidImportModel>[]> {
        return await this.importAsync(sourceData);
    }

    public async importAsync(
        sourceData: IImportSource
    ): Promise<IImportItemResult<ValidImportContract, ValidImportModel>[]> {
        const importedItems: IImportItemResult<ValidImportContract, ValidImportModel>[] = [];
        await printProjectInfoToConsoleAsync(this.client);

        // log information regarding version mismatch
        if (version !== sourceData.metadata.version) {
            console.warn(
                `WARNING: Version mismatch. Current version of '${name}' is '${version}', but package was created in version '${sourceData.metadata.version}'.`
            );
            console.warn(
                `Import may still succeed, but if it doesn't, please try using '${sourceData.metadata.version}' version of this library. `
            );
        }

        if (this.config.enableLog) {
            console.log(`Translating object ids to codenames`);
        }

        // this is an optional step where users can exclude certain objects from being
        // imported via import configuration.
        // this has to be done before translating ids
        this.removeSkippedItemsFromImport(sourceData);

        // translate ids to codenames for certain objects types
        this.translateIds(sourceData);

        if (this.config.enableLog) {
            console.log(`Removing skipped items`);
        }

        if (this.config.enableLog) {
            console.log(`Importing data`);
        }

        // import order matters

        // ### Asset folders
        if (sourceData.assetFolders.length) {
            const importedAssetFolders = await this.importAssetFoldersAsync(sourceData.assetFolders);
            importedItems.push(...importedAssetFolders);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping asset folders`);
            }
        }

        // ### Languages
        if (sourceData.importData.languages.length) {
            const importedLanguages = await this.importLanguagesAsync(sourceData.importData.languages);
            importedItems.push(...importedLanguages);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping languages`);
            }
        }

        // ### Taxonomies
        if (sourceData.importData.taxonomies.length) {
            const importedTaxonomies = await this.importTaxonomiesAsync(sourceData.importData.taxonomies);
            importedItems.push(...importedTaxonomies);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping taxonomies`);
            }
        }

        // ### Content types & snippets
        if (sourceData.importData.contentTypeSnippets.length) {
            await this.importContentTypeSnippetsAsync(sourceData.importData.contentTypeSnippets);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping content type snippets`);
            }
        }

        if (sourceData.importData.contentTypes.length) {
            await this.importContentTypesAsync(sourceData.importData.contentTypes);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping content types`);
            }
        }

        // ### Workflows
        if (sourceData.importData.workflows.length) {
            const importedWorkflows = await this.importWorkflowsAsync(sourceData.importData.workflows);
            importedItems.push(...importedWorkflows);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping workflows`);
            }
        }

        // ### Assets
        if (sourceData.importData.assets.length) {
            const importedAssets = await this.importAssetsAsync(
                sourceData.importData.assets,
                sourceData.binaryFiles,
                importedItems
            );
            importedItems.push(...importedAssets);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping assets`);
            }
        }

        // ### Content items
        if (sourceData.importData.contentItems.length) {
            const importedContentItems = await this.importContentItemAsync(sourceData.importData.contentItems);
            importedItems.push(...importedContentItems);
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping content items`);
            }
        }

        // ### Language variants
        if (sourceData.importData.languageVariants) {
            const importedLanguageVariants = await this.importLanguageVariantsAsync(
                sourceData.importData.languageVariants,
                importedItems,
                sourceData.importData.workflows
            );
            importedItems.push(...importedLanguageVariants);

            if (this.config.preserveWorkflow) {
                await this.setWorkflowStepsOfLanguageVariantsAsync(
                    sourceData.importData.languageVariants,
                    sourceData.importData.workflows
                );
            }

            if (this.config.workflowIdForImportedItems) {
                await this.moveLanguageVariantsToCustomWorkflowStepAsync(
                    this.config.workflowIdForImportedItems,
                    sourceData.importData.languageVariants
                );
            }
        } else {
            if (this.config.enableLog) {
                console.log(`Skipping language variants`);
            }
        }

        if (this.config.enableLog) {
            console.log(`Finished importing data`);
        }

        return importedItems;
    }

    private translateIds(source: IImportSource): void {
        const defaultLanguageCodename = source.importData.languages.find((m) => m.id === defaultObjectId)?.codename;

        // in following objects replace id references with external ids
        translationHelper.replaceIdReferencesWithExternalId(source.importData.taxonomies);
        translationHelper.replaceIdReferencesWithExternalId(source.importData.contentTypeSnippets);
        translationHelper.replaceIdReferencesWithExternalId(source.importData.contentTypes);

        // in following objects replace id references with codename
        translationHelper.replaceIdReferencesWithCodenames(source.importData.languages, source.importData, {});
        translationHelper.replaceIdReferencesWithCodenames(
            source.importData.assets,
            source.importData,
            {},
            defaultLanguageCodename
        );
        translationHelper.replaceIdReferencesWithCodenames(source.importData.contentItems, source.importData, {});

        // first replace workflow id in language variant (due to default id being the same in workflow and language)
        translationHelper.replaceIdReferencesWithCodenames(
            source.importData.languageVariants.map((m) => m.workflow),
            source.importData,
            {},
            defaultWorkflowCodename
        );
        translationHelper.replaceIdReferencesWithCodenames(
            source.importData.languageVariants.map((m) => m.workflow_step),
            source.importData,
            {},
            defaultWorkflowCodename
        );
        // and then rest of ids
        translationHelper.replaceIdReferencesWithCodenames(
            source.importData.languageVariants,
            source.importData,
            {},
            defaultLanguageCodename
        );

        translationHelper.replaceIdReferencesWithCodenames(
            source.importData.workflows,
            source.importData,
            {},
            defaultWorkflowCodename
        );
    }

    private removeSkippedItemsFromImport(source: IImportSource): void {
        if (this.config.canImport && this.config.canImport.asset) {
            for (const item of source.importData.assets) {
                const shouldImport = this.config.canImport.asset(item);
                if (!shouldImport) {
                    source.importData.assets = source.importData.assets.filter((m) => m.id !== item.id);
                }
            }
        }

        if (this.config.canImport && this.config.canImport.workflow) {
            for (const item of source.importData.workflows) {
                const shouldImport = this.config.canImport.workflow(item);
                if (!shouldImport) {
                    source.importData.workflows = source.importData.workflows.filter((m) => m.id !== item.id);
                }
            }
        }

        if (this.config.canImport && this.config.canImport.language) {
            for (const item of source.importData.languages) {
                const shouldImport = this.config.canImport.language(item);
                if (!shouldImport) {
                    source.importData.languages = source.importData.languages.filter((m) => m.id !== item.id);
                }
            }
        }

        if (this.config.canImport && this.config.canImport.assetFolder) {
            for (const item of source.assetFolders) {
                const shouldImport = this.config.canImport.assetFolder(item);
                if (!shouldImport) {
                    source.assetFolders = source.assetFolders.filter((m) => m.id !== item.id);
                }
            }
        }

        if (this.config.canImport && this.config.canImport.contentType) {
            for (const item of source.importData.contentTypes) {
                const shouldImport = this.config.canImport.contentType(item);
                if (!shouldImport) {
                    source.importData.contentTypes = source.importData.contentTypes.filter((m) => m.id !== item.id);
                }
            }
        }

        if (this.config.canImport && this.config.canImport.contentItem) {
            for (const item of source.importData.contentItems) {
                const shouldImport = this.config.canImport.contentItem(item);
                if (!shouldImport) {
                    source.importData.contentItems = source.importData.contentItems.filter((m) => m.id !== item.id);
                }
            }
        }

        if (this.config.canImport && this.config.canImport.contentTypeSnippet) {
            for (const item of source.importData.contentTypeSnippets) {
                const shouldImport = this.config.canImport.contentTypeSnippet(item);
                if (!shouldImport) {
                    source.importData.contentTypeSnippets = source.importData.contentTypeSnippets.filter(
                        (m) => m.id !== item.id
                    );
                }
            }
        }

        if (this.config.canImport && this.config.canImport.languageVariant) {
            for (const item of source.importData.languageVariants) {
                const shouldImport = this.config.canImport.languageVariant(item);
                if (!shouldImport) {
                    source.importData.languageVariants = source.importData.languageVariants.filter(
                        (m) => m.item.id !== item.item.id && m.language.id !== item.language.id
                    );
                }
            }
        }

        if (this.config.canImport && this.config.canImport.taxonomy) {
            for (const item of source.importData.taxonomies) {
                const shouldImport = this.config.canImport.taxonomy(item);
                if (!shouldImport) {
                    source.importData.taxonomies = source.importData.taxonomies.filter((m) => m.id !== item.id);
                }
            }
        }
    }

    private async fixLanguageAsync(
        currentLanguages: LanguageModels.LanguageModel[],
        importLanguage: LanguageContracts.ILanguageModelContract
    ): Promise<void> {
        // check if language with given codename already exists
        const existingLanguage = currentLanguages.find((m) => m.codename === importLanguage.codename);

        if (existingLanguage) {
            // activate inactive languages
            if (!existingLanguage.isActive) {
                console.log(
                    `Language '${yellow(existingLanguage.name)}' with codename '${yellow(
                        existingLanguage.codename
                    )}' is not active in target project. Activating language.`
                );

                await this.client
                    .modifyLanguage()
                    .byLanguageCodename(existingLanguage.codename)
                    .withData([
                        {
                            op: 'replace',
                            property_name: 'is_active',
                            value: true
                        }
                    ])
                    .toPromise();
            }
        }

        // fix codename when source & target languages do not match
        if (importLanguage.is_default) {
            const defaultExistingLanguage = currentLanguages.find((m) => m.id === importLanguage.id);

            if (!defaultExistingLanguage) {
                throw Error(
                    `Invalid default existing language. Language with id '${yellow(importLanguage.id)}' was not found.`
                );
            }
            if (importLanguage.codename !== defaultExistingLanguage.codename) {
                // languages do not match, change it
                console.log(
                    `Default language '${yellow(importLanguage.name)}' with codename '${yellow(
                        importLanguage.codename
                    )}' does not match default language in target project. Changing language codename in target project from '${
                        defaultExistingLanguage.codename
                    }' codename to '${importLanguage.codename}'`
                );

                // check if language with imported codename exists
                if (!currentLanguages.find((m) => m.codename === importLanguage.codename)) {
                    // language with required codename does not exist, update it
                    await this.client
                        .modifyLanguage()
                        .byLanguageCodename(defaultExistingLanguage.codename)
                        .withData([
                            {
                                op: 'replace',
                                property_name: 'codename',
                                value: importLanguage.codename
                            }
                        ])
                        .toPromise();
                } else {
                    console.log(
                        `Language with codename '${yellow(
                            importLanguage.codename
                        )}' already exists in target project, skipping update operation`
                    );
                }
            }
        }
    }

    private tryGetLanguage(
        currentLanguages: LanguageModels.LanguageModel[],
        importLanguage: LanguageContracts.ILanguageModelContract
    ): LanguageModels.IAddLanguageData | 'noImport' {
        // check if language with given codename already exists
        const existingLanguage = currentLanguages.find((m) => m.codename === importLanguage.codename);

        if (existingLanguage) {
            // no need to import it
            console.log(
                `Skipping language '${yellow(existingLanguage.name)}' with codename '${yellow(
                    existingLanguage.codename
                )}'`
            );
            return 'noImport';
        }

        // check if language codename of default language matches
        if (importLanguage.id === this.defaultLanguageId) {
            const defaultCurrentLanguage = currentLanguages.find((m) => m.id === this.defaultLanguageId);

            if (defaultCurrentLanguage && defaultCurrentLanguage.codename !== importLanguage.codename) {
                // default language codename is source project is different than target project
                throw Error(
                    `Codename of default language from imported data does not match target project. The source language codename is '${importLanguage.codename}' while target is '${defaultCurrentLanguage.codename}'. Please update codename of default language in target project to be '${importLanguage.codename}`
                );
            }
        }

        // 'codename' property is set in codename translator
        const fallbackLanguageCodename = (importLanguage.fallback_language as any).codename;

        if (!fallbackLanguageCodename) {
            throw Error(`Language '${importLanguage.name}' has unset codename`);
        }

        return {
            codename: importLanguage.codename,
            name: importLanguage.name,
            external_id: importLanguage.external_id,
            fallback_language:
                importLanguage.codename === fallbackLanguageCodename
                    ? { id: this.defaultLanguageId }
                    : { codename: fallbackLanguageCodename },
            is_active: importLanguage.is_active
        };
    }

    private async importLanguagesAsync(
        languages: LanguageContracts.ILanguageModelContract[]
    ): Promise<IImportItemResult<LanguageContracts.ILanguageModelContract, LanguageModels.LanguageModel>[]> {
        const importedItems: IImportItemResult<
            LanguageContracts.ILanguageModelContract,
            LanguageModels.LanguageModel
        >[] = [];

        // get current languages in project
        let currentLanguagesResponse = await this.client.listLanguages().toAllPromise();

        for (const language of languages) {
            // fix language if necessary
            if (this.config.fixLanguages) {
                await this.fixLanguageAsync(currentLanguagesResponse.data.items, language);

                // reload existing languages = they were fixed
                currentLanguagesResponse = await this.client.listLanguages().toAllPromise();
            }

            const processedLanguageData = this.tryGetLanguage(currentLanguagesResponse.data.items, language);

            if (processedLanguageData === 'noImport') {
                continue;
            }

            await this.client
                .addLanguage()
                .withData(processedLanguageData)
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: language,
                        importId: response.data.id,
                        originalId: language.id
                    });
                    this.processItem(response.data.name, 'language', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importAssetsAsync(
        assets: AssetContracts.IAssetModelContract[],
        binaryFiles: IBinaryFile[],
        currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
    ): Promise<IImportItemResult<AssetContracts.IAssetModelContract, AssetModels.Asset>[]> {
        const importedItems: IImportItemResult<AssetContracts.IAssetModelContract, AssetModels.Asset>[] = [];
        const unsupportedBinaryFiles: IBinaryFile[] = [];

        for (const asset of assets) {
            const binaryFile = binaryFiles.find((m) => m.asset.id === asset.id);

            if (!binaryFile) {
                throw Error(`Could not find binary file for asset with id '${asset.id}'`);
            }

            let binaryDataToUpload: any = binaryFile.binaryData;
            if (binaryFile.asset.size >= this.maxAllowedAssetSizeInBytes) {
                if (this.config.onUnsupportedBinaryFile) {
                    this.config.onUnsupportedBinaryFile(binaryFile);
                }
                console.log(
                    `Removing binary data from file due to size. Max. file size is '${this.maxAllowedAssetSizeInBytes}'Bytes, but file has '${asset.size}' Bytes`,
                    asset.file_name
                );
                // remove binary data so that import proceeds & asset is created (so that it can be referenced by
                // content items )
                binaryDataToUpload = [];
                unsupportedBinaryFiles.push(binaryFile);
            }

            const uploadedBinaryFile = await this.client
                .uploadBinaryFile()
                .withData({
                    binaryData: binaryDataToUpload,
                    contentType: asset.type,
                    filename: asset.file_name
                })
                .toPromise()
                .then((m) => m)
                .catch((error) => this.handleImportError(error));

            if (!uploadedBinaryFile) {
                throw Error(`File not uploaded`);
            }

            const assetData = this.getAddAssetModel(asset, uploadedBinaryFile.data.id, currentItems);

            await this.client
                .addAsset()
                .withData((builder) => assetData)
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: asset,
                        importId: response.data.id,
                        originalId: asset.id
                    });
                    this.processItem(response.data.fileName, 'asset', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importAssetFoldersAsync(
        assetFolders: AssetFolderContracts.IAssetFolderContract[]
    ): Promise<IImportItemResult<AssetFolderContracts.IAssetFolderContract, AssetFolderModels.AssetFolder>[]> {
        const importedItems: IImportItemResult<
            AssetFolderContracts.IAssetFolderContract,
            AssetFolderModels.AssetFolder
        >[] = [];
        // set external id for all folders to equal old id (needed to match referenced folders)
        this.setExternalIdForFolders(assetFolders);

        const assetFoldersToAdd = assetFolders.map((m) => this.mapAssetFolder(m));

        await this.client
            .addAssetFolders()
            .withData({
                folders: assetFoldersToAdd
            })
            .toPromise()
            .then((response) => {
                const importedFlattenedFolders: IImportItemResult<
                    AssetFolderContracts.IAssetFolderContract,
                    AssetFolderModels.AssetFolder
                >[] = [];

                const flattenedAssetFolderContracts: AssetFolderContracts.IAssetFolderContract[] = [];

                this.flattenAssetFolderContracts(assetFolders, flattenedAssetFolderContracts);
                this.flattenAssetFolders(response.data.items, flattenedAssetFolderContracts, importedFlattenedFolders);

                for (const flattenedFolder of importedFlattenedFolders) {
                    importedItems.push(flattenedFolder);
                    this.processItem(flattenedFolder.imported.name, 'assetFolder', flattenedFolder.imported);
                }
            })
            .catch((error) => this.handleImportError(error));

        return importedItems;
    }

    private async importContentTypesAsync(
        contentTypes: ContentTypeContracts.IContentTypeContract[]
    ): Promise<IImportItemResult<ContentTypeContracts.IContentTypeContract, ContentTypeModels.ContentType>[]> {
        const importedItems: IImportItemResult<
            ContentTypeContracts.IContentTypeContract,
            ContentTypeModels.ContentType
        >[] = [];

        for (const contentType of contentTypes) {
            await this.client
                .addContentType()
                .withData((builder) => {
                    return {
                        elements: contentType.elements as ContentTypeElements.IElementShared[],
                        name: contentType.name,
                        codename: contentType.codename,
                        content_groups: contentType.content_groups,
                        external_id: contentType.external_id
                    };
                })
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: contentType,
                        importId: response.data.id,
                        originalId: contentType.id
                    });
                    this.processItem(response.data.name, 'contentType', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importContentItemAsync(
        contentItems: ContentItemContracts.IContentItemModelContract[]
    ): Promise<IImportItemResult<ContentItemContracts.IContentItemModelContract, ContentItemModels.ContentItem>[]> {
        const importedItems: IImportItemResult<
            ContentItemContracts.IContentItemModelContract,
            ContentItemModels.ContentItem
        >[] = [];

        for (const contentItem of contentItems) {
            const typeCodename = (contentItem.type as any).codename;

            if (!typeCodename) {
                throw Error(`Content item '${contentItem.codename}' has unset type codename`);
            }

            await this.client
                .addContentItem()
                .withData({
                    name: contentItem.name,
                    type: {
                        codename: typeCodename
                    },
                    codename: contentItem.codename,
                    external_id: contentItem.external_id
                })
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: contentItem,
                        importId: response.data.id,
                        originalId: contentItem.id
                    });
                    this.processItem(response.data.name, 'contentItem', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async setWorkflowStepsOfLanguageVariantsAsync(
        languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[],
        workflows: WorkflowContracts.IWorkflowContract[]
    ): Promise<void> {
        if (!languageVariants.length) {
            return;
        }

        for (const languageVariant of languageVariants) {
            const itemCodename: string | undefined = languageVariant.item.codename;
            const languageCodename: string | undefined = languageVariant.language.codename;
            const workflowStepCodename: string | undefined = languageVariant.workflow_step.codename;

            if (!itemCodename) {
                throw Error(`Missing item codename for item '${languageVariant.item.id}'`);
            }
            if (!languageCodename) {
                throw Error(`Missing language codename for item '${itemCodename}'`);
            }

            if (!workflowStepCodename) {
                throw Error(`Missing workflow step codename for item '${itemCodename}'`);
            }

            const isPublished = this.isLanguageVariantPublished(languageVariant, workflows);
            const isArchived = this.isLanguageVariantArchived(languageVariant, workflows);

            if (isPublished) {
                await this.client
                    .publishLanguageVariant()
                    .byItemCodename(itemCodename)
                    .byLanguageCodename(languageCodename)
                    .withoutData()
                    .toPromise()
                    .then((response) => {
                        this.processItem(`${itemCodename} (${languageCodename})`, 'publish', response.data);
                    })
                    .catch((error) => this.handleImportError(error));
            } else if (isArchived) {
                const workflow = this.getWorkflow(languageVariant, workflows);

                await this.client
                    .changeWorkflowOfLanguageVariant()
                    .byItemCodename(itemCodename)
                    .byLanguageCodename(languageCodename)
                    .withData({
                        step_identifier: {
                            codename: workflow.archived_step.codename
                        },
                        workflow_identifier: {
                            codename: workflow.codename
                        }
                    })
                    .toPromise()
                    .then((response) => {
                        this.processItem(`${itemCodename} (${languageCodename})`, 'archive', response.data);
                    })
                    .catch((error) => this.handleImportError(error));
            } else {
                const workflowData = this.getWorkflowAndStepOfLanguageVariant(languageVariant, workflows);
                if (!workflowData) {
                    throw Error(`Invalid workflow data for language variant '${itemCodename}'`);
                }
                await this.client
                    .changeWorkflowOfLanguageVariant()
                    .byItemCodename(itemCodename)
                    .byLanguageCodename(languageCodename)
                    .withData({
                        step_identifier: {
                            codename: workflowData.workflowStep.codename
                        },
                        workflow_identifier: {
                            codename: workflowData.workflow.codename
                        }
                    })
                    .toPromise()
                    .then((response) => {
                        this.processItem(
                            `${itemCodename} (${languageCodename}) - ${workflowData.workflow.name} -> ${workflowData.workflowStep.name}`,
                            'changeWorkflowStep',
                            response.data
                        );
                    })
                    .catch((error) => this.handleImportError(error));
            }
        }
    }

    private isLanguageVariantPublished(
        languageVariant: LanguageVariantContracts.ILanguageVariantModelContract,
        workflows: WorkflowContracts.IWorkflowContract[]
    ): boolean {
        for (const workflow of workflows) {
            if (workflow.published_step.codename === languageVariant.workflow_step.codename) {
                return true;
            }
        }

        return false;
    }

    private isLanguageVariantArchived(
        languageVariant: LanguageVariantContracts.ILanguageVariantModelContract,
        workflows: WorkflowContracts.IWorkflowContract[]
    ): boolean {
        for (const workflow of workflows) {
            if (workflow.archived_step.codename === languageVariant.workflow_step.codename) {
                return true;
            }
        }

        return false;
    }

    private getWorkflowAndStepOfLanguageVariant(
        languageVariant: LanguageVariantContracts.ILanguageVariantModelContract,
        workflows: WorkflowContracts.IWorkflowContract[]
    ):
        | {
              workflow: WorkflowContracts.IWorkflowContract;
              workflowStep: WorkflowContracts.IWorkflowStepNewContract;
          }
        | undefined {
        for (const workflow of workflows) {
            for (const workflowStep of workflow.steps) {
                if (workflowStep.codename.toLowerCase() === languageVariant.workflow_step.codename?.toLowerCase()) {
                    return {
                        workflow,
                        workflowStep
                    };
                }
            }
        }

        return undefined;
    }

    private getWorkflow(
        languageVariant: LanguageVariantContracts.ILanguageVariantModelContract,
        workflows: WorkflowContracts.IWorkflowContract[]
    ): WorkflowContracts.IWorkflowContract {
        const workflow = workflows.find(
            (m) => m.codename.toLowerCase() === languageVariant.workflow.workflow_identifier.codename?.toLowerCase()
        );

        if (!workflow) {
            throw Error(`Missing workflow '${languageVariant.workflow.workflow_identifier.codename}'`);
        }

        return workflow;
    }

    private async moveLanguageVariantsToCustomWorkflowStepAsync(
        workflowStepId: string,
        languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[]
    ): Promise<void> {
        for (const item of languageVariants) {
            const itemCodename: string | undefined = item.item.codename;
            const languageCodename: string | undefined = item.language.codename;

            if (!itemCodename) {
                throw Error(`Missing item codename for item`);
            }
            if (!languageCodename) {
                throw Error(`Missing language codename for item`);
            }

            await this.client
                .changeWorkflowStepOfLanguageVariant()
                .byItemCodename(itemCodename)
                .byLanguageCodename(languageCodename)
                .byWorkflowStepId(workflowStepId)
                .toPromise()
                .then((response) => {
                    this.processItem(`${itemCodename} (${languageCodename})`, 'changeWorkflowStep', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }
    }

    private async importLanguageVariantsAsync(
        languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[],
        currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[],
        workflows: WorkflowContracts.IWorkflowContract[]
    ): Promise<
        IImportItemResult<
            LanguageVariantContracts.ILanguageVariantModelContract,
            LanguageVariantModels.ContentItemLanguageVariant
        >[]
    > {
        const importedItems: IImportItemResult<
            LanguageVariantContracts.ILanguageVariantModelContract,
            LanguageVariantModels.ContentItemLanguageVariant
        >[] = [];

        for (const languageVariant of languageVariants) {
            const itemCodename: string | undefined = languageVariant.item.codename;
            const languageCodename: string | undefined = languageVariant.language.codename;

            if (!itemCodename) {
                throw Error(`Missing item codename for item '${languageVariant.item.id}'`);
            }
            if (!languageCodename) {
                throw Error(`Missing language codename for item '${itemCodename}'`);
            }

            // replace ids in assets with new ones
            idTranslateHelper.replaceIdReferencesWithNewId(languageVariant, currentItems);

            await this.client
                .upsertLanguageVariant()
                .byItemCodename(itemCodename)
                .byLanguageCodename(languageCodename)
                .withData((builder) => {
                    const workflow = this.getWorkflow(languageVariant, workflows);

                    return {
                        elements: languageVariant.elements,
                        workflow: {
                            workflow_identifier: {
                                codename: workflow.codename
                            },
                            step_identifier: {
                                codename: workflow.steps[0].codename
                            }
                        }
                    };
                })
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: languageVariant,
                        importId: response.data.item.id,
                        originalId: languageVariant.item.id
                    });
                    this.processItem(`${itemCodename} (${languageCodename})`, 'languageVariant', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importContentTypeSnippetsAsync(
        contentTypeSnippets: ContentTypeSnippetContracts.IContentTypeSnippetContract[]
    ): Promise<IImportItemResult<ContentTypeContracts.IContentTypeContract, ContentTypeModels.ContentType>[]> {
        const importedItems: IImportItemResult<
            ContentTypeContracts.IContentTypeContract,
            ContentTypeModels.ContentType
        >[] = [];

        for (const contentTypeSnippet of contentTypeSnippets) {
            await this.client
                .addContentTypeSnippet()
                .withData((builder) => {
                    return {
                        elements: contentTypeSnippet.elements,
                        name: contentTypeSnippet.name,
                        codename: contentTypeSnippet.codename,
                        external_id: contentTypeSnippet.external_id
                    } as any;
                })
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: contentTypeSnippet,
                        importId: response.data.id,
                        originalId: contentTypeSnippet.id
                    });
                    this.processItem(response.data.name, 'contentTypeSnippet', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importTaxonomiesAsync(
        taxonomies: TaxonomyContracts.ITaxonomyContract[]
    ): Promise<IImportItemResult<TaxonomyContracts.ITaxonomyContract, TaxonomyModels.Taxonomy>[]> {
        const importedItems: IImportItemResult<TaxonomyContracts.ITaxonomyContract, TaxonomyModels.Taxonomy>[] = [];
        for (const taxonomy of taxonomies) {
            await this.client
                .addTaxonomy()
                .withData(taxonomy)
                .toPromise()
                .then((response) => {
                    importedItems.push({
                        imported: response.data,
                        original: taxonomy,
                        importId: response.data.id,
                        originalId: taxonomy.id
                    });
                    this.processItem(response.data.name, 'taxonomy', response.data);
                })
                .catch((error) => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importWorkflowsAsync(
        workflows: WorkflowContracts.IWorkflowContract[]
    ): Promise<IImportItemResult<WorkflowContracts.IWorkflowContract, WorkflowModels.Workflow>[]> {
        const importedItems: IImportItemResult<WorkflowContracts.IWorkflowContract, WorkflowModels.Workflow>[] = [];
        for (const workflow of workflows) {
            // remove roles from workflow steps because roles can't yet be imported via API
            for (const workflowStep of workflow.steps) {
                workflowStep.role_ids = [];
            }
            workflow.archived_step.role_ids = [];
            workflow.published_step.create_new_version_role_ids = [];
            workflow.published_step.unpublish_role_ids = [];

            // default workflow needs to be updated
            if (workflow.codename.toLowerCase() === defaultWorkflowCodename.toLowerCase()) {
                // remove ids for default steps
                for (const workflowStep of workflow.steps) {
                    workflowStep.id = undefined as any;

                    for (const transitionTo of workflowStep.transitions_to) {
                        transitionTo.step.id = undefined;
                    }
                }

                workflow.archived_step.id = undefined as any;
                workflow.published_step.id = undefined as any;
                workflow.scheduled_step.id = undefined as any;

                await this.client
                    .updateWorkflow()
                    .byWorkflowCodename(workflow.codename)
                    .withData(workflow)
                    .toPromise()
                    .then((response) => {
                        importedItems.push({
                            imported: response.data,
                            original: workflow,
                            importId: response.data.id,
                            originalId: workflow.id
                        });
                        this.processItem(response.data.name, 'workflow', response.data);
                    })
                    .catch((error) => this.handleImportError(error));
            } else {
                await this.client
                    .addWorkflow()
                    .withData(workflow)
                    .toPromise()
                    .then((response) => {
                        importedItems.push({
                            imported: response.data,
                            original: workflow,
                            importId: response.data.id,
                            originalId: workflow.id
                        });
                        this.processItem(response.data.name, 'workflow', response.data);
                    })
                    .catch((error) => this.handleImportError(error));
            }
        }

        return importedItems;
    }

    private handleImportError(error: any | SharedModels.ContentManagementBaseKontentError): void {
        handleError(error);
    }

    private processItem(title: string, type: ActionType, data: any): void {
        if (!this.config.onImport) {
            return;
        }

        this.config.onImport({
            data,
            title,
            type
        });
    }

    private getAddAssetModel(
        assetContract: AssetContracts.IAssetModelContract,
        binaryFileId: string,
        currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
    ): AssetModels.IAddAssetRequestData {
        const model: AssetModels.IAddAssetRequestData = {
            descriptions: assetContract.descriptions,
            file_reference: {
                id: binaryFileId,
                type: assetContract.file_reference.type
            },
            external_id: assetContract.external_id,
            folder: assetContract.folder,
            title: assetContract.title
        };

        // replace ids
        idTranslateHelper.replaceIdReferencesWithNewId(model, currentItems);

        return model;
    }

    private setExternalIdForFolders(folders: AssetFolderContracts.IAssetFolderContract[]): void {
        for (const folder of folders) {
            folder.external_id = folder.id;

            if (folder.folders.length) {
                this.setExternalIdForFolders(folder.folders);
            }
        }
    }

    private flattenAssetFolders(
        importedAssetFolders: AssetFolderModels.AssetFolder[],
        originalItems: AssetFolderContracts.IAssetFolderContract[],
        items: IImportItemResult<AssetFolderContracts.IAssetFolderContract, AssetFolderModels.AssetFolder>[]
    ): void {
        for (const assetFolder of importedAssetFolders) {
            const originalFolder = originalItems.find((m) => m.external_id === assetFolder.externalId);

            if (!originalFolder) {
                throw Error(
                    `Could not find original folder with id '${assetFolder.externalId}' with name '${assetFolder.name}'`
                );
            }

            items.push({
                imported: assetFolder,
                original: originalFolder,
                importId: assetFolder.id,
                originalId: originalFolder.id
            });

            if (assetFolder.folders.length) {
                this.flattenAssetFolders(assetFolder.folders, originalItems, items);
            }
        }
    }

    private flattenAssetFolderContracts(
        assetFolders: AssetFolderContracts.IAssetFolderContract[],
        flattened: AssetFolderContracts.IAssetFolderContract[]
    ): void {
        for (const assetFolder of assetFolders) {
            flattened.push(assetFolder);

            if (assetFolder.folders.length) {
                this.flattenAssetFolderContracts(assetFolder.folders, flattened);
            }
        }
    }

    private mapAssetFolder(
        folder: AssetFolderContracts.IAssetFolderContract
    ): AssetFolderModels.IAddOrModifyAssetFolderData {
        return {
            name: folder.name,
            external_id: folder.external_id,
            folders: folder.folders?.map((m) => this.mapAssetFolder(m)) ?? []
        };
    }
}
