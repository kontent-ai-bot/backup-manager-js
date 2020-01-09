import { IProcessedItem, ItemType } from '../core';

export interface IImportConfig {
    projectId: string;
    apiKey: string;
    processItem?: (item: IProcessedItem) => void;
    skip?: {
        languages?: boolean
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

export interface IImportData {
    orderedImportItems: IPreparedImportItem[];
}

export interface IImportItemResult<TRaw, TModel> {
    original: TRaw;
    imported: TModel;
}
