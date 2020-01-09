import {
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    IManagementClient,
    ManagementClient,
    TaxonomyContracts,
} from '@kentico/kontent-management';

import { IExportAllResult, IExportConfig, IExportData } from './export.models';

export class ExportService {
    private readonly client: IManagementClient;

    constructor(private config: IExportConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            projectId: config.projectId
        });
    }

    public async exportAllAsync(): Promise<IExportAllResult> {
        const data: IExportData = {
            contentTypes: await this.exportContentTypesAsync(),
            contentTypeSnippets: await this.exportContentTypeSnippetsAsync(),
            taxonomies: await this.exportTaxonomiesAsync()
        };

        return {
            metadata: {
                timestamp: new Date(),
                projectId: this.config.projectId
            },
            data
        };
    }

    public async exportTaxonomiesAsync(): Promise<TaxonomyContracts.ITaxonomyContract[]> {
        const response = await this.client.listTaxonomies().toPromise();
        return response.data.taxonomies.map(m => m._raw);
    }

    public async exportContentTypeSnippetsAsync(): Promise<ContentTypeSnippetContracts.IContentTypeSnippetContract[]> {
        const response = await this.client.listContentTypeSnippets().toAllPromise();
        return response.data.items.map(m => m._raw);
    }

    public async exportContentTypesAsync(): Promise<ContentTypeContracts.IContentTypeContract[]> {
        const response = await this.client.listContentTypes().toAllPromise();
        return response.data.items.map(m => m._raw);
    }
}
