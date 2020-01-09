import {
    ContentItemContracts,
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    TaxonomyContracts,
    LanguageVariantContracts,
    LanguageContracts,
    AssetContracts,
} from '@kentico/kontent-management';

export interface IExportConfig {
    projectId: string;
    apiKey: string;
}

export interface IExportData {
    taxonomies: TaxonomyContracts.ITaxonomyContract[];
    contentTypeSnippets: ContentTypeSnippetContracts.IContentTypeSnippetContract[];
    contentTypes: ContentTypeContracts.IContentTypeContract[];
    contentItems: ContentItemContracts.IContentItemModelContract[];
    languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[];
    languages: LanguageContracts.ILanguageModelContract[];
    assets: AssetContracts.IAssetModelContract[];
}

export interface IExportAllResult {
    metadata: {
        timestamp: Date;
        projectId: string;
    };
    data: IExportData;
}
