import {
    AssetContracts,
    ContentItemContracts,
    ContentTypeContracts,
    ContentTypeSnippetContracts,
    LanguageContracts,
    LanguageVariantContracts,
    TaxonomyContracts,
    AssetFolderContracts,
} from '@kentico/kontent-management';

import { IProcessedItem, ItemType } from '../core';

export interface IImportConfig {
    workflowIdForImportedItems: string;
    projectId: string;
    apiKey: string;
    processItem?: (item: IProcessedItem) => void;
    skip?: {
        languages?: boolean;
    };
}

export interface IImportAllResult {
    metadata: {
        timestamp: Date;
        projectId: string;
    };
}

export interface IPreparedImportItem {
    type: ItemType;
    codename: string;
    item: any;
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
    orderedImportItems: IPreparedImportItem[];
    assetFolders: AssetFolderContracts.IAssetFolderContract[];
    binaryFiles: IBinaryFile[];
}

export interface IFlattenedFolder {
    name: string;
    externalId?: string;
    id: string;
}
