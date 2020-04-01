import { ImportService } from 'src';
import { ZipService } from 'src/zip';

const run = async () => {
    const zipService = new ZipService({
        filename: 'xxx',
        enableLog: true
    });

    const importService = new ImportService({
        onImport: item => {
            // called when any content is imported
            console.log(`Imported: ${item.title} | ${item.type}`);
        },
        projectId: 'targetProjectId',
        apiKey: 'targetProjectId',
        enableLog: true,
        fixLanguages: true,
        workflowIdForImportedItems: '00000000-0000-0000-0000-000000000000' // id that items are assigned
    });

    // read export data from zip
    const data = await zipService.extractZipAsync();

    // restore into target project
    await importService.importFromSourceAsync(data);
};

run();
