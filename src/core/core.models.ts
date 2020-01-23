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
} from '@kentico/kontent-management';

export interface ICliFileConfig {
    projectId: string;
    apiKey: string;
    action: CliAction;
    zipFilename: string;
    enableLog: boolean;
    importLanguages: boolean;
    force: boolean;
}

export type CliAction = 'backup' | 'restore' | 'clean';
export type ItemType =
    | 'taxonomy'
    | 'dummyContentType'
    | 'contentType'
    | 'dummyContentTypeSnippet'
    | 'contentTypeSnippet'
    | 'contentItem'
    | 'languageVariant'
    | 'language'
    | 'asset'
    | 'assetFolder'
    | 'binaryFile';

export type ValidImportModel =
    | ContentTypeModels.ContentType
    | TaxonomyModels.Taxonomy
    | ContentTypeSnippetModels.ContentTypeSnippet
    | LanguageVariantModels.ContentItemLanguageVariant
    | ContentItemModels.ContentItem
    | LanguageModels.LanguageModel
    | AssetModels.Asset
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
    | AssetFolderContracts.IAssetFolderContract;

export interface IProcessedItem {
    title: string;
    type: ItemType;
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
