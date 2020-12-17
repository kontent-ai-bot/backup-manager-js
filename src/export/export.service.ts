import {
    ContentItemContracts,
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    IManagementClient,
    LanguageVariantContracts,
    ManagementClient,
    TaxonomyContracts,
    AssetContracts,
    LanguageContracts,
    AssetFolderContracts,
    ProjectContracts
} from '@kentico/kontent-management';

import { IExportAllResult, IExportConfig, IExportData } from './export.models';
import { ItemType } from '../core';
import { version } from '../../package.json';

export class ExportService {
    private readonly client: IManagementClient;

    constructor(private config: IExportConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            projectId: config.projectId,
            baseUrl: config.baseUrl
        });
    }

    public async exportAllAsync(): Promise<IExportAllResult> {
        const exportItems = {
            asset: this.config.exportFilter?.includes('asset') ?? true,
            assetFolder: this.config.exportFilter?.includes('assetFolder') ?? true,
            binaryFile: this.config.exportFilter?.includes('binaryFile') ?? true,
            contentItem: this.config.exportFilter?.includes('contentItem') ?? true,
            contentType: this.config.exportFilter?.includes('contentType') ?? true,
            contentTypeSnippet: this.config.exportFilter?.includes('contentTypeSnippet') ?? true,
            language: this.config.exportFilter?.includes('language') ?? true,
            languageVariant: this.config.exportFilter?.includes('languageVariant') ?? true,
            taxonomy: this.config.exportFilter?.includes('taxonomy') ?? true
        };

        const contentTypes = await this.exportContentTypesAsync({ processItem: exportItems.contentType });
        const projectValidation = await this.exportProjectValidationAsync();
        const contentItems = exportItems.contentItem || exportItems.languageVariant ? await this.exportContentItemsAsync() : []

        const data: IExportData = {
            contentTypes: exportItems.contentType ? contentTypes : [],
            contentTypeSnippets: exportItems.contentTypeSnippet ? await this.exportContentTypeSnippetsAsync() : [],
            taxonomies: exportItems.taxonomy ? await this.exportTaxonomiesAsync() : [],
            contentItems: exportItems.contentItem ? await this.exportContentItemsAsync() : [],
            languageVariants: exportItems.languageVariant
                ? await this.exportLanguageVariantsAsync(contentItems.map((m) => m.id))
                : [],
            assets: exportItems.asset ? await this.exportAssetsAsync() : [],
            languages: exportItems.language ? await this.exportLanguagesAsync() : [],
            assetFolders: exportItems.assetFolder ? await this.exportAssetFoldersAsync() : []
        };

        return {
            metadata: {
                version,
                timestamp: new Date(),
                projectId: this.config.projectId,
                isInconsistentExport:
                    projectValidation.type_issues.length > 0 || projectValidation.variant_issues.length > 0,
                dataOverview: {
                    assetFoldersCount: data.assetFolders.length,
                    assetsCount: data.assets.length,
                    contentItemsCount: data.contentItems.length,
                    contentTypeSnippetsCount: data.contentTypeSnippets.length,
                    contentTypesCount: data.contentTypes.length,
                    languageVariantsCount: data.languageVariants.length,
                    languagesCount: data.languages.length,
                    taxonomiesCount: data.taxonomies.length
                }
            },
            validation: projectValidation,
            data
        };
    }

    public async exportProjectValidationAsync(): Promise<ProjectContracts.IProjectReportResponseContract> {
        const response = await this.client.validateProjectContent().forProjectId(this.config.projectId).toPromise();
        return response.rawData;
    }

    public async exportAssetsAsync(): Promise<AssetContracts.IAssetModelContract[]> {
        const response = await this.client
            .listAssets()
            .withListQueryConfig({
                responseFetched: (listResponse, token) => {
                    listResponse.data.items.forEach((m) => this.processItem(m.fileName, 'asset', m));
                }
            })
            .toAllPromise();
        return response.data.items.map((m) => m._raw);
    }

    public async exportAssetFoldersAsync(): Promise<AssetFolderContracts.IAssetFolderContract[]> {
        const response = await this.client.listAssetFolders().toPromise();
        response.data.items.forEach((m) => this.processItem(m.name, 'assetFolder', m));
        return response.data.items.map((m) => m._raw);
    }

    public async exportLanguagesAsync(): Promise<LanguageContracts.ILanguageModelContract[]> {
        const response = await this.client
            .listLanguages()
            .withListQueryConfig({
                responseFetched: (listResponse, token) => {
                    listResponse.data.items.forEach((m) => this.processItem(m.name, 'language', m));
                }
            })
            .toAllPromise();
        return response.data.items.map((m) => m._raw);
    }

    public async exportTaxonomiesAsync(): Promise<TaxonomyContracts.ITaxonomyContract[]> {
        const response = await this.client.listTaxonomies().toPromise();
        response.data.taxonomies.forEach((m) => this.processItem(m.name, 'taxonomy', m));
        return response.data.taxonomies.map((m) => m._raw);
    }

    public async exportContentTypeSnippetsAsync(): Promise<ContentTypeSnippetContracts.IContentTypeSnippetContract[]> {
        const response = await this.client
            .listContentTypeSnippets()
            .withListQueryConfig({
                responseFetched: (listResponse, token) => {
                    listResponse.data.items.forEach((m) => this.processItem(m.name, 'contentTypeSnippet', m));
                }
            })
            .toAllPromise();
        return response.data.items.map((m) => m._raw);
    }

    public async exportContentTypesAsync(data: {
        processItem: boolean;
    }): Promise<ContentTypeContracts.IContentTypeContract[]> {
        const response = await this.client
            .listContentTypes()
            .withListQueryConfig({
                responseFetched: (listResponse, token) => {
                    if (data.processItem) {
                        listResponse.data.items.forEach((m) => this.processItem(m.name, 'contentType', m));
                    }
                }
            })
            .toAllPromise();
        return response.data.items.map((m) => m._raw);
    }

    public async exportContentItemsAsync(): Promise<ContentItemContracts.IContentItemModelContract[]> {
        const response = await this.client
            .listContentItems()
            .withListQueryConfig({
                responseFetched: (listResponse, token) => {
                    listResponse.data.items.forEach((m) => this.processItem(m.name, 'contentItem', m));
                }
            })
            .toAllPromise();
        return response.data.items.map((m) => m._raw);
    }

    public async exportLanguageVariantsAsync(
        contentItemIds: string[]
    ): Promise<LanguageVariantContracts.ILanguageVariantModelContract[]> {
        const languageVariants: LanguageVariantContracts.ILanguageVariantModelWithComponentsContract[] = [];

        for (const contentItemId of contentItemIds) {
            const response = await this.client
                .listLanguageVariantsOfItem()
                .byItemId(contentItemId)
                .toPromise();


                languageVariants.push(...response.data.items.map((m) => m._raw));
                response.data.items.forEach((m) =>
                    this.processItem(m.item.id?.toString() ?? '-', 'languageVariant', m)
                );
        }

        return languageVariants;
    }

    private processItem(title: string, type: ItemType, data: any): void {
        if (!this.config.onExport) {
            return;
        }

        this.config.onExport({
            data,
            title,
            type
        });
    }
}
