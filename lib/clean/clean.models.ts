import { IProcessedItem } from '../core';
import { IRetryStrategyOptions } from '@kontent-ai/core-sdk';

export interface ICleanConfig {
    projectId: string;
    apiKey: string;
    baseUrl?: string;
    onDelete?: (item: IProcessedItem) => void;
    retryStrategy?: IRetryStrategyOptions;
}

export interface ICleanResult {
    metadata: {
        timestamp: Date,
        projectId: string;
    };
}
