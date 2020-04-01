import { HttpService } from '@kentico/kontent-core';
import {
    AssetContracts,
    AssetFolderContracts,
    AssetFolderModels,
    AssetModels,
    ContentItemContracts,
    ContentItemModels,
    ContentTypeContracts,
    ContentTypeModels,
    ContentTypeSnippetContracts,
    IManagementClient,
    LanguageContracts,
    LanguageModels,
    LanguageVariantContracts,
    LanguageVariantModels,
    ManagementClient,
    TaxonomyContracts,
    TaxonomyModels,
    SharedModels,
} from '@kentico/kontent-management';

import {
    translationHelper,
    idTranslateHelper,
    IImportItemResult,
    ItemType,
    ValidImportContract,
    ValidImportModel,
} from '../core';
import { IBinaryFile, IImportConfig, IImportSource } from './import.models';

export class ImportService {
    private readonly defaultLanguageId: string = '00000000-0000-0000-0000-000000000000';
    private readonly client: IManagementClient;

    /**
     * Maximum allowed size of asset in Bytes.
     * Currently 1e8 = 100 MB
     */
    private readonly maxAllowedAssetSizeInBytes: number = 1e8;

    constructor(private config: IImportConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            projectId: config.projectId,
            retryStrategy: {
                addJitter: true,
                canRetryError: err => true, // so that timeout errors are retried
                maxAttempts: 3,
                deltaBackoffMs: 1000,
                maxCumulativeWaitTimeMs: 60000
            },
            httpService: new HttpService({
                axiosRequestConfig: {
                    // required for uploading large files
                    // https://github.com/axios/axios/issues/1362
                    maxContentLength: 'Infinity' as any
                }
            })
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
        if (this.config.enableLog) {
            console.log(`Translating object ids to codenames`);
        }

        // translate ids to codenames for certain objects types
        this.translateIds(sourceData);

        if (this.config.enableLog) {
            console.log(`Removing skipped items`);
        }

        // this is an optional step where users can exclude certain objects from being
        // imported via import configuration.
        this.removeSkippedItemsFromImport(sourceData);

        if (this.config.enableLog) {
            console.log(`Importing data`);
        }

        // import order matters

        // ### Asset folders
        const importedAssetFolders = await this.importAssetFoldersAsync(sourceData.assetFolders, importedItems);
        importedItems.push(...importedAssetFolders);

        // ### Languages
        const importedLanguages = await this.importLanguagesAsync(sourceData.importData.languages);
        importedItems.push(...importedLanguages);

        // ### Taxonomies
        const importedTaxonomies = await this.importTaxonomiesAsync(sourceData.importData.taxonomies);
        importedItems.push(...importedTaxonomies);

        // ### Content types & snippets
        await this.importContentTypeSnippetsAsync(sourceData.importData.contentTypeSnippets);
        await this.importContentTypesAsync(sourceData.importData.contentTypes);

        // ### Assets
        const importedAssets = await this.importAssetsAsync(
            sourceData.importData.assets,
            sourceData.binaryFiles,
            importedItems
        );
        importedItems.push(...importedAssets);

        // ### Content items
        const importedContentItems = await this.importContentItemAsync(sourceData.importData.contentItems);
        importedItems.push(...importedContentItems);

        // ### Language variants
        const importedLanguageVariants = await this.importLanguageVariantsAsync(
            sourceData.importData.languageVariants,
            importedItems
        );
        importedItems.push(...importedLanguageVariants);

        if (this.config.enableLog) {
            console.log(`Finished importing data`);
        }

        return importedItems;
    }

    private translateIds(source: IImportSource): void {
        // in following objects replace id references with external ids
        translationHelper.replaceIdReferencesWithExternalId(source.importData.taxonomies);
        translationHelper.replaceIdReferencesWithExternalId(source.importData.contentTypeSnippets);
        translationHelper.replaceIdReferencesWithExternalId(source.importData.contentTypes);

        // in following objects replace id references with codename
        translationHelper.replaceIdReferencesWithCodenames(source.importData.languages, source.importData, {});
        translationHelper.replaceIdReferencesWithCodenames(source.importData.assets, source.importData, {});
        translationHelper.replaceIdReferencesWithCodenames(source.importData.contentItems, source.importData, {});
        translationHelper.replaceIdReferencesWithCodenames(
            source.importData.languageVariants,
            source.importData,
            {}
        );
    }

    private removeSkippedItemsFromImport(source: IImportSource): void {
        if (this.config.process && this.config.process.asset) {
            for (const item of source.importData.assets) {
                const shouldImport = this.config.process.asset(item);
                if (!shouldImport) {
                    source.importData.assets = source.importData.assets.filter(m => m.id !== item.id);
                }
            }
        }

        if (this.config.process && this.config.process.language) {
            for (const item of source.importData.languages) {
                const shouldImport = this.config.process.language(item);
                if (!shouldImport) {
                    source.importData.languages = source.importData.languages.filter(m => m.id !== item.id);
                }
            }
        }

        if (this.config.process && this.config.process.assetFolder) {
            for (const item of source.assetFolders) {
                const shouldImport = this.config.process.assetFolder(item);
                if (!shouldImport) {
                    source.assetFolders = source.assetFolders.filter(m => m.id !== item.id);
                }
            }
        }

        if (this.config.process && this.config.process.contentType) {
            for (const item of source.importData.contentTypes) {
                const shouldImport = this.config.process.contentType(item);
                if (!shouldImport) {
                    source.importData.contentTypes = source.importData.contentTypes.filter(m => m.id !== item.id);
                }
            }
        }

        if (this.config.process && this.config.process.contentItem) {
            for (const item of source.importData.contentItems) {
                const shouldImport = this.config.process.contentItem(item);
                if (!shouldImport) {
                    source.importData.contentItems = source.importData.contentItems.filter(m => m.id !== item.id);
                }
            }
        }

        if (this.config.process && this.config.process.contentTypeSnippet) {
            for (const item of source.importData.contentTypeSnippets) {
                const shouldImport = this.config.process.contentTypeSnippet(item);
                if (!shouldImport) {
                    source.importData.contentTypeSnippets = source.importData.contentTypeSnippets.filter(
                        m => m.id !== item.id
                    );
                }
            }
        }

        if (this.config.process && this.config.process.languageVariant) {
            for (const item of source.importData.languageVariants) {
                const shouldImport = this.config.process.languageVariant(item);
                if (!shouldImport) {
                    source.importData.languageVariants = source.importData.languageVariants.filter(
                        m => m.item.id !== item.item.id && m.language.id !== item.language.id
                    );
                }
            }
        }

        if (this.config.process && this.config.process.taxonomy) {
            for (const item of source.importData.taxonomies) {
                const shouldImport = this.config.process.taxonomy(item);
                if (!shouldImport) {
                    source.importData.taxonomies = source.importData.taxonomies.filter(m => m.id !== item.id);
                }
            }
        }
    }

    private tryGetLanguage(
        currentLanguages: LanguageModels.LanguageModel[],
        importLanguage: LanguageContracts.ILanguageModelContract
    ): LanguageModels.IAddLanguageData | 'noImport' {
        // check if language with given codename already exists
        const existingLanguage = currentLanguages.find(m => m.codename === importLanguage.codename);

        if (existingLanguage) {
            // no need to import it
            console.log(`Skipping language '${existingLanguage.name}' with codename '${existingLanguage.codename}'`);
            return 'noImport';
        }

        // check if language codename of default language matches
        if (importLanguage.id === this.defaultLanguageId) {
            const defaultCurrentLanguage = currentLanguages.find(m => m.id === this.defaultLanguageId);

            // verify that codenames matches, otherwise end program
            if (defaultCurrentLanguage && defaultCurrentLanguage.codename !== importLanguage.codename) {
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
        const currentLanguagesResponse = await this.client.listLanguages().toAllPromise();

        for (const language of languages) {
            const processedLanguageData = this.tryGetLanguage(currentLanguagesResponse.data.items, language);

            if (processedLanguageData === 'noImport') {
                continue;
            }

            await this.client
                .addLanguage()
                .withData(processedLanguageData)
                .toPromise()
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: language,
                        importId: response.data.id,
                        originalId: language.id
                    });
                    this.processItem(response.data.name, 'language', response.data);
                })
                .catch(error => this.handleImportError(error));
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
            const binaryFile = binaryFiles.find(m => m.asset.id === asset.id);

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
                .then(m => m)
                .catch(error => this.handleImportError(error));

            if (!uploadedBinaryFile) {
                throw Error(`File not uploaded`);
            }

            const assetData = this.getAddAssetModel(asset, uploadedBinaryFile.data.id, currentItems);

            await this.client
                .addAsset()
                .withData(assetData)
                .toPromise()
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: asset,
                        importId: response.data.id,
                        originalId: asset.id
                    });
                    this.processItem(response.data.fileName, 'asset', response.data);
                })
                .catch(error => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importAssetFoldersAsync(
        assetFolders: AssetFolderContracts.IAssetFolderContract[],
        currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
    ): Promise<IImportItemResult<AssetFolderContracts.IAssetFolderContract, AssetFolderModels.AssetFolder>[]> {
        const importedItems: IImportItemResult<
            AssetFolderContracts.IAssetFolderContract,
            AssetFolderModels.AssetFolder
        >[] = [];
        // set external id for all folders to equal old id (needed to match referenced folders)
        this.setExternalIdForFolders(assetFolders);

        const assetFoldersToAdd = assetFolders.map(m => this.mapAssetFolder(m));

        await this.client
            .addAssetFolders()
            .withData({
                folders: assetFoldersToAdd
            })
            .toPromise()
            .then(response => {
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
            .catch(error => this.handleImportError(error));

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
                .withData(builder => {
                    return contentType;
                })
                .toPromise()
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: contentType,
                        importId: response.data.id,
                        originalId: contentType.id
                    });
                    this.processItem(response.data.name, 'contentType', response.data);
                })
                .catch(error => this.handleImportError(error));
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
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: contentItem,
                        importId: response.data.id,
                        originalId: contentItem.id
                    });
                    this.processItem(response.data.name, 'contentItem', response.data);
                })
                .catch(error => this.handleImportError(error));
        }

        return importedItems;
    }

    private async importLanguageVariantsAsync(
        languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[],
        currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
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
                throw Error(`Missing item codename for item`);
            }
            if (!languageCodename) {
                throw Error(`Missing language codename for item`);
            }

            // replace ids in assets with new ones
            idTranslateHelper.replaceIdReferencesWithNewId(languageVariant, currentItems);

            // set workflow id (there is no API to create workflows programatically)
            languageVariant.workflow_step.id = this.config.workflowIdForImportedItems;

            await this.client
                .upsertLanguageVariant()
                .byItemCodename(itemCodename)
                .byLanguageCodename(languageCodename)
                .withElements(languageVariant.elements)
                .toPromise()
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: languageVariant,
                        importId: response.data.item.id,
                        originalId: languageVariant.item.id
                    });
                    this.processItem(`${itemCodename} (${languageCodename})`, 'languageVariant', response.data);
                })
                .catch(error => this.handleImportError(error));
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
                .withData(builder => {
                    return {
                        elements: contentTypeSnippet.elements,
                        name: contentTypeSnippet.name,
                        codename: contentTypeSnippet.codename,
                        external_id: contentTypeSnippet.external_id
                    };
                })
                .toPromise()
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: contentTypeSnippet,
                        importId: response.data.id,
                        originalId: contentTypeSnippet.id
                    });
                    this.processItem(response.data.name, 'contentTypeSnippet', response.data);
                })
                .catch(error => this.handleImportError(error));
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
                .then(response => {
                    importedItems.push({
                        imported: response.data,
                        original: taxonomy,
                        importId: response.data.id,
                        originalId: taxonomy.id
                    });
                    this.processItem(response.data.name, 'taxonomy', response.data);
                })
                .catch(error => this.handleImportError(error));
        }

        return importedItems;
    }

    private handleImportError(error: any | SharedModels.ContentManagementBaseKontentError): void {
        console.log(error);
        throw error;
    }

    private processItem(title: string, type: ItemType, data: any): void {
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
            const originalFolder = originalItems.find(m => m.external_id === assetFolder.externalId);

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
            folders: folder.folders?.map(m => this.mapAssetFolder(m)) ?? []
        };
    }
}
