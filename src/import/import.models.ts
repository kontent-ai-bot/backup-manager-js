import {
    AssetContracts,
    AssetFolderContracts,
    ContentItemContracts,
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    LanguageContracts,
    LanguageVariantContracts,
    TaxonomyContracts,
} from '@kentico/kontent-management';

import { IImportItemResult, IProcessedItem, ItemType, ValidImportContract, ValidImportModel } from '../core';

export interface IImportConfig {
    workflowIdForImportedItems: string;
    projectId: string;
    apiKey: string;
    enableLog: boolean;
    onImport?: (item: IProcessedItem) => void;
    process?: {
        taxonomy?: (
            item: TaxonomyContracts.ITaxonomyContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        contentTypeSnippet?: (
            item: ContentTypeSnippetContracts.IContentTypeSnippetContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        contentType?: (
            item: ContentTypeContracts.IContentTypeContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        contentItem?: (
            item: ContentItemContracts.IContentItemModelContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        languageVariant?: (
            item: LanguageVariantContracts.ILanguageVariantModelContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        language?: (
            item: LanguageContracts.ILanguageModelContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        asset?: (
            item: AssetContracts.IAssetModelContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
        assetFolder?: (
            item: AssetFolderContracts.IAssetFolderContract,
            currentItems: IImportItemResult<ValidImportContract, ValidImportModel>[]
        ) => boolean | Promise<boolean>;
    };
}

export interface IImportAllResult {
    metadata: {
        timestamp: Date;
        projectId: string;
    };
}

export interface IPreparedImportItem<TItem = any> {
    type: ItemType;
    codename: string;
    item: TItem;
    deps: string[];
}

export interface IBinaryFile {
    binaryData: any;
    asset: AssetContracts.IAssetModelContract;
}

export interface IImportSource {
    importData: {
        taxonomies: TaxonomyContracts.ITaxonomyContract[];
        contentTypeSnippets: ContentTypeSnippetContracts.IContentTypeSnippetContract[];
        contentTypes: ContentTypeContracts.IContentTypeContract[];
        contentItems: ContentItemContracts.IContentItemModelContract[];
        languageVariants: LanguageVariantContracts.ILanguageVariantModelContract[];
        languages: LanguageContracts.ILanguageModelContract[];
        assets: AssetContracts.IAssetModelContract[];
    };
    assetFolders: AssetFolderContracts.IAssetFolderContract[];
    binaryFiles: IBinaryFile[];
}

export interface IImportData {
    orderedImportItems: IPreparedImportItem<any>[];
    assetFolders: AssetFolderContracts.IAssetFolderContract[];
    binaryFiles: IBinaryFile[];
}

export interface IFlattenedFolder {
    name: string;
    externalId?: string;
    id: string;
}
