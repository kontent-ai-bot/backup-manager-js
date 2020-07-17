import { IProcessedItem } from '../core';

export interface ICleanConfig {
    projectId: string;
    apiKey: string;
    baseUrl?: string;
    onDelete?: (item: IProcessedItem) => void;
}

export interface ICleanResult {
    metadata: {
        timestamp: Date,
        projectId: string;
    };
}
