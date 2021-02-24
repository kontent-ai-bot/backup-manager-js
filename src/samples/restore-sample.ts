import { ImportService } from 'src';
import { ZipService } from '../zip';
import { FileService } from '../node-js';

const run = async () => {
    const zipService = new ZipService({
        enableLog: true,
        context: 'node.js'
    });

    const fileService = new FileService({
        enableLog: true
    });

    const importService = new ImportService({
        onImport: item => {
            // called when any content is imported
            console.log(`Imported: ${item.title} | ${item.type}`);
        },
        enablePublish: true,
        projectId: 'targetProjectId',
        apiKey: 'targetProjectId',
        enableLog: true,
        fixLanguages: true,
        workflowIdForImportedItems: '00000000-0000-0000-0000-000000000000' // id that items are assigned
    });

    // read file
    const file = fileService.loadFileAsync('fileName');

    // extract file
    const data = await zipService.extractZipAsync(file);

    // restore into target project
    await importService.importFromSourceAsync(data);
};

run();
