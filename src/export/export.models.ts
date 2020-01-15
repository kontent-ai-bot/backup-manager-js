import {
    ContentItemContracts,
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    TaxonomyContracts,
    LanguageVariantContracts,
    LanguageContracts,
    AssetContracts,
    AssetFolderContracts,
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
    assetFolders: AssetFolderContracts.IAssetFolderContract[];
}

export interface IExportMetadata {
    projectId: string;
    timestamp: Date;
}

export interface IExportAllResult {
    metadata: IExportMetadata;
    data: IExportData;
}
