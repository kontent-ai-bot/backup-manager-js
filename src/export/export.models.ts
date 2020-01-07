import { ContentTypeContracts, ContentTypeSnippetContracts, TaxonomyContracts } from '@kentico/kontent-management';

export interface IExportConfig {
    projectId: string;
    apiKey: string;
}

export interface IExportData {
    taxonomies: TaxonomyContracts.ITaxonomyContract[];
    contentTypeSnippets: ContentTypeSnippetContracts.IContentTypeSnippetContract[];
    contentTypes: ContentTypeContracts.IContentTypeContract[];
}

export interface IExportAllResult {
    metadata: {
        timestamp: Date;
        projectId: string;
    };
    data: IExportData;
}
