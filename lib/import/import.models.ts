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
} from '@kontent-ai/management-sdk';

import { IProcessedItem, ItemType, IPackageMetadata } from '../core';

export interface IImportConfig {
    workflowIdForImportedItems?: string;
    baseUrl?: string;
    projectId: string;
    apiKey: string;
    enableLog: boolean;
    preserveWorkflow: boolean;
    onUnsupportedBinaryFile?: (binaryFile: IBinaryFile) => void;
    onImport?: (item: IProcessedItem) => void;
    fixLanguages: boolean;
    canImport?: {
        workflow?: (item: WorkflowContracts.IWorkflowContract) => boolean | Promise<boolean>;
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

export interface IPreparedImportItem<TItem> {
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
        workflows: WorkflowContracts.IWorkflowContract[];
    };
    metadata: IPackageMetadata;
    validation: ProjectContracts.IProjectReportResponseContract;
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
