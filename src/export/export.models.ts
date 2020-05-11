import {
    AssetContracts,
    AssetFolderContracts,
    ContentItemContracts,
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    LanguageContracts,
    LanguageVariantContracts,
    TaxonomyContracts,
    ProjectContracts,
} from '@kentico/kontent-management';

import { IProcessedItem, IPackageMetadata } from '../core';

export interface IExportConfig {
    projectId: string;
    apiKey: string;
    onExport?: (item: IProcessedItem) => void;
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

export interface IExportAllResult {
    metadata: IPackageMetadata;
    data: IExportData;
    validation: ProjectContracts.IProjectReportResponseContract;
}
