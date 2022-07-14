import {
    AssetContracts,
    AssetModels,
    ContentItemModels,
    ContentTypeContracts,
    ContentTypeModels,
    ContentTypeSnippetContracts,
    ContentTypeSnippetModels,
    LanguageContracts,
    LanguageModels,
    LanguageVariantModels,
    TaxonomyContracts,
    TaxonomyModels,
    LanguageVariantContracts,
    ContentItemContracts,
    AssetFolderModels,
    AssetFolderContracts,
    WorkflowContracts,
    WorkflowModels
} from '@kontent-ai/management-sdk';

export interface ICliFileConfig {
    projectId: string;
    apiKey: string;
    action: CliAction;
    zipFilename: string;
    enableLog: boolean;
    preserveWorkflow: boolean;
    force: boolean;
    baseUrl?: string;
    exportFilter?: ItemType[];
    skipValidation?: boolean;
}

export type CliAction = 'backup' | 'restore' | 'clean';
export type ItemType =
    | 'taxonomy'
    | 'contentType'
    | 'contentTypeSnippet'
    | 'contentItem'
    | 'languageVariant'
    | 'language'
    | 'asset'
    | 'assetFolder'
    | 'collection'
    | 'webhook'
    | 'workflow'
    | 'binaryFile';

export type ActionType = ItemType | 'archive' | 'publish' | 'changeWorkflowStep';

export type ValidImportModel =
    | ContentTypeModels.ContentType
    | TaxonomyModels.Taxonomy
    | ContentTypeSnippetModels.ContentTypeSnippet
    | LanguageVariantModels.ContentItemLanguageVariant
    | ContentItemModels.ContentItem
    | LanguageModels.LanguageModel
    | AssetModels.Asset
    | WorkflowModels.Workflow
    | AssetFolderModels.AssetFolder;

export type ValidImportContract =
    | ContentTypeContracts.IContentTypeContract
    | TaxonomyContracts.ITaxonomyContract
    | ContentTypeSnippetContracts.IContentTypeSnippetContract
    | ContentItemContracts.IContentItemModelContract
    | TaxonomyContracts.ITaxonomyContract
    | AssetContracts.IAssetModelContract
    | LanguageVariantContracts.ILanguageVariantModelContract
    | LanguageContracts.ILanguageModelContract
    | WorkflowContracts.IWorkflowContract
    | AssetFolderContracts.IAssetFolderContract;

export interface IProcessedItem {
    title: string;
    type: ActionType;
    data: any;
}

export interface IImportItemResult<TRaw, TModel> {
    original: TRaw;
    imported: TModel;

    originalId?: string;
    importId?: string;
}

export interface IIdCodenameTranslationResult {
    [key: string]: string;
}

export interface IPackageMetadata {
    version: string;
    projectId: string;
    timestamp: Date;
    isInconsistentExport: boolean;
    dataOverview: IPackageDataOverview;
}

export interface IPackageDataOverview {
    taxonomiesCount: number;
    contentTypeSnippetsCount: number;
    contentTypesCount: number;
    contentItemsCount: number;
    languageVariantsCount: number;
    languagesCount: number;
    assetsCount: number;
    assetFoldersCount: number;
    workflowsCount: number;
    webhooksCount: number;
    collectionsCount: number;
}
