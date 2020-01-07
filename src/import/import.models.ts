import { IProcessedItem } from '../models';

export interface IImportConfig {
    projectId: string;
    apiKey: string;
    processItem?: (item: IProcessedItem) => void;
}

export interface IImportAllResult {
    metadata: {
        timestamp: Date,
        projectId: string
    };
}
