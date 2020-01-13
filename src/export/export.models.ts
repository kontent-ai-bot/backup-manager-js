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

export interface IExportMetadata {
    projectId: string;
    timestamp: Date;
}

export interface IExportAllResult {
    metadata: IExportMetadata;
    data: IExportData;
}
