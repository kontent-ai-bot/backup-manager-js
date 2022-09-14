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
    WebhookContracts,
    CollectionContracts
} from '@kontent-ai/management-sdk';
import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';

import { IProcessedItem, IPackageMetadata, ItemType } from '../core';

export interface IExportConfig {
    projectId: string;
    apiKey: string;
    baseUrl?: string;
    onExport?: (item: IProcessedItem) => void;
    exportFilter?: ItemType[];
    skipValidation: boolean;
    retryStrategy?: IRetryStrategyOptions;
}

export interface IExportData {
    workflows: WorkflowContracts.IWorkflowContract[];
    taxonomies: TaxonomyContracts.ITaxonomyContract[];
    contentTypeSnippets: ContentTypeSnippetContracts.IContentTypeSnippetContract[];
    contentTypes: ContentTypeContracts.IContentTypeContract[];
    contentItems: ContentItemContracts.IContentItemModelContract[];
    languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[];
    languages: LanguageContracts.ILanguageModelContract[];
    assets: AssetContracts.IAssetModelContract[];
    webhooks: WebhookContracts.IWebhookContract[];
    collections: CollectionContracts.ICollectionContract[];
    assetFolders: AssetFolderContracts.IAssetFolderContract[];
}

export interface IExportAllResult {
    metadata: IPackageMetadata;
    data: IExportData;
    validation: ProjectContracts.IProjectReportResponseContract | string;
}
