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
} from '@kentico/kontent-management';

import { IExportAllResult, IExportConfig, IExportData } from './export.models';
import { ItemType } from '../core';

export class ExportService {
    private readonly client: IManagementClient;

    constructor(private config: IExportConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            projectId: config.projectId
        });
    }

    public async exportAllAsync(): Promise<IExportAllResult> {
        const contentTypes = await this.exportContentTypesAsync();

        const data: IExportData = {
            contentTypes,
            contentTypeSnippets: await this.exportContentTypeSnippetsAsync(),
            taxonomies: await this.exportTaxonomiesAsync(),
            contentItems: await this.exportContentItemsAsync(),
            languageVariants: await this.exportLanguageVariantsAsync(contentTypes.map(m => m.id)),
            assets: await this.exportAssetsAsync(),
            languages: await this.exportLanguagesAsync(),
            assetFolders: await this.exportAssetFoldersAsync()
        };

        return {
            metadata: {
                timestamp: new Date(),
                projectId: this.config.projectId
            },
            data
        };
    }

    public async exportAssetsAsync(): Promise<AssetContracts.IAssetModelContract[]> {
        const response = await this.client.listAssets().toPromise();
        response.data.items.forEach(m => this.processItem(m.fileName, 'asset', m));
        return response.data.items.map(m => m._raw);
    }

    public async exportAssetFoldersAsync(): Promise<AssetFolderContracts.IAssetFolderContract[]> {
        const response = await this.client.listAssetFolders().toPromise();
        response.data.items.forEach(m => this.processItem(m.name, 'assetFolder', m));
        return response.data.items.map(m => m._raw);
    }

    public async exportLanguagesAsync(): Promise<LanguageContracts.ILanguageModelContract[]> {
        const response = await this.client.listLanguages().toPromise();
        response.data.items.forEach(m => this.processItem(m.name, 'language', m));
        return response.data.items.map(m => m._raw);
    }

    public async exportTaxonomiesAsync(): Promise<TaxonomyContracts.ITaxonomyContract[]> {
        const response = await this.client.listTaxonomies().toPromise();
        response.data.taxonomies.forEach(m => this.processItem(m.name, 'taxonomy', m));
        return response.data.taxonomies.map(m => m._raw);
    }

    public async exportContentTypeSnippetsAsync(): Promise<ContentTypeSnippetContracts.IContentTypeSnippetContract[]> {
        const response = await this.client.listContentTypeSnippets().toAllPromise();
        response.data.items.forEach(m => this.processItem(m.name, 'contentTypeSnippet', m));
        return response.data.items.map(m => m._raw);
    }

    public async exportContentTypesAsync(): Promise<ContentTypeContracts.IContentTypeContract[]> {
        const response = await this.client.listContentTypes().toAllPromise();
        response.data.items.forEach(m => this.processItem(m.name, 'contentType', m));
        return response.data.items.map(m => m._raw);
    }

    public async exportContentItemsAsync(): Promise<ContentItemContracts.IContentItemModelContract[]> {
        const response = await this.client.listContentItems().toAllPromise();
        response.data.items.forEach(m => this.processItem(m.name, 'contentItem', m));
        return response.data.items.map(m => m._raw);
    }

    public async exportLanguageVariantsAsync(
        typeIds: string[]
    ): Promise<LanguageVariantContracts.ILanguageVariantModelContract[]> {
        const languageVariants: LanguageVariantContracts.ILanguageVariantModelWithComponentsContract[] = [];

        for (const typeId of typeIds) {
            languageVariants.push(
                ...(
                    await this.client
                        .listLanguageVariantsOfContentTypeWithComponents()
                        .byTypeId(typeId)
                        .toPromise()
                ).data.items.map(m => m._raw)
            );

            languageVariants.push(
                ...(
                    await this.client
                        .listLanguageVariantsOfContentType()
                        .byTypeId(typeId)
                        .toPromise()
                ).data.items.map(m => m._raw)
            );
        }

        languageVariants.forEach(m => this.processItem(m.item.id?.toString() ?? '-', 'languageVariant', m));

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
