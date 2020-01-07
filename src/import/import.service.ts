import {
    ContentTypeContracts,
    ContentTypeModels,
    ContentTypeSnippetContracts,
    ContentTypeSnippetModels,
    IManagementClient,
    ManagementClient,
    TaxonomyContracts,
    TaxonomyModels,
} from '@kentico/kontent-management';

import { IExportData } from '../export';
import { IImportAllResult, IImportConfig } from './import.models';
import { ItemType } from 'src/models';

export class ImportService {
    private readonly client: IManagementClient;

    constructor(private config: IImportConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            projectId: config.projectId
        });
    }

    public async importFromExportDataAsync(exportData: IExportData): Promise<IImportAllResult> {
        await this.importTaxonomiesAsync(exportData.taxonomies);
        await this.importContentTypeSnippetsAsync(exportData.contentTypeSnippets);
        await this.importContentTypesAsync(exportData.contentTypes);

        return {
            metadata: {
                projectId: this.config.projectId,
                timestamp: new Date()
            }
        };
    }

    public async importContentTypesAsync(
        contentTypes: ContentTypeContracts.IContentTypeContract[]
    ): Promise<ContentTypeModels.ContentType[]> {
        const importedContentTypes: ContentTypeModels.ContentType[] = [];

        for (const contentType of contentTypes) {
            await this.client
                .addContentType()
                .withData(builder => {
                    return contentType;
                })
                .toPromise()
                .then(response => {
                    importedContentTypes.push(response.data);
                    this.processItem(response.data.name, 'contentType', response.data);
                })
                .catch(error => this.handleImportError(error));
        }

        return importedContentTypes;
    }

    public async importContentTypeSnippetsAsync(
        contentTypeSnippets: ContentTypeSnippetContracts.IContentTypeSnippetContract[]
    ): Promise<ContentTypeModels.ContentType[]> {
        const importedContentTypeSnippets: ContentTypeSnippetModels.ContentTypeSnippet[] = [];

        for (const contentTypeSnippet of contentTypeSnippets) {
            await this.client
                .addContentTypeSnippet()
                .withData(builder => {
                    return contentTypeSnippet;
                })
                .toPromise()
                .then(response => {
                    importedContentTypeSnippets.push(response.data);
                    this.processItem(response.data.name, 'contentTypeSnippet', response.data);
                })
                .catch(error => this.handleImportError(error));
        }

        return importedContentTypeSnippets;
    }

    public async importTaxonomiesAsync(
        taxonomies: TaxonomyContracts.ITaxonomyContract[]
    ): Promise<TaxonomyModels.Taxonomy[]> {
        const importedTaxonomies: TaxonomyModels.Taxonomy[] = [];

        for (const taxonomy of taxonomies) {
            await this.client
                .addTaxonomy()
                .withData(taxonomy)
                .toPromise()
                .then(response => {
                    importedTaxonomies.push(response.data);
                    this.processItem(response.data.name, 'taxonomy', response.data);
                })
                .catch(error => this.handleImportError(error));
        }

        return importedTaxonomies;
    }

    private handleImportError(error: any): void {
        console.log(error);
    }

    private processItem(title: string, type: ItemType, data: any): void {
        if (!this.config.processItem) {
            return;
        }

        this.config.processItem({
            data,
            title,
            type
        });
    }
}
