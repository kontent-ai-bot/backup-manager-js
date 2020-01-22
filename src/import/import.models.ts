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

import { IProcessedItem, ItemType } from '../core';

export interface IImportConfig {
    workflowIdForImportedItems: string;
    projectId: string;
    apiKey: string;
    enableLog: boolean;
    onUnsupportedBinaryFile?: (binaryFile: IBinaryFile) => void;
    onImport?: (item: IProcessedItem) => void;
    process?: {
        taxonomy?: (item: TaxonomyContracts.ITaxonomyContract) => boolean | Promise<boolean>;
        contentTypeSnippet?: (
            item: ContentTypeSnippetContracts.IContentTypeSnippetContract
        ) => boolean | Promise<boolean>;
        contentType?: (item: ContentTypeContracts.IContentTypeContract) => boolean | Promise<boolean>;
        contentItem?: (item: ContentItemContracts.IContentItemModelContract) => boolean | Promise<boolean>;
        languageVariant?: (item: LanguageVariantContracts.ILanguageVariantModelContract) => boolean | Promise<boolean>;
        language?: (item: LanguageContracts.ILanguageModelContract) => boolean | Promise<boolean>;
        asset?: (item: AssetContracts.IAssetModelContract) => boolean | Promise<boolean>;
        assetFolder?: (item: AssetFolderContracts.IAssetFolderContract) => boolean | Promise<boolean>;
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
