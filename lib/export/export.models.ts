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
    WorkflowContracts,
} from '@kentico/kontent-management';

import { IProcessedItem, IPackageMetadata, ItemType } from '../core';

export interface IExportConfig {
    projectId: string;
    apiKey: string;
    baseUrl?: string;
    onExport?: (item: IProcessedItem) => void;
    exportFilter?: ItemType[];
}

export interface IExportData {
    workflowSteps: WorkflowContracts.IWorkflowStepContract[];
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
