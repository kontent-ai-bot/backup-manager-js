import { promises } from 'fs';

export class FileHelper {
    async createFileInCurrentFolderAsync(filename: string, data: any): Promise<void> {
        const filePath = './' + filename;

        await promises.writeFile(filePath, data);
    }
}

export const fileHelper = new FileHelper();
