import { SharedModels } from '@kontent-ai/management-sdk';

export function getFilenameWithoutExtension(filename: string): string {
    if (!filename) {
        throw Error(`Invalid filename`);
    }

    if (!filename.includes('.')) {
        return filename;
    }

    return filename.split('.').slice(0, -1).join('.');
}

export function handleError(error: any | SharedModels.ContentManagementBaseKontentError): void {
    let result = error;
    if (error instanceof SharedModels.ContentManagementBaseKontentError) {
        result = {
            Message: `Failed to import data with error: ${error.message}`,
            ErrorCode: error.errorCode,
            RequestId: error.requestId,
            ValidationErrors: `${error.validationErrors.map((m) => m.message).join(', ')}`
        };
    }
    throw result;
}
