import { ZipService } from 'src/zip';

import { ExportService } from '../export';

const run = async () => {
    const exportService = new ExportService({
        apiKey: 'sourceProjectApiKey',
        projectId: 'sourceProjectId',
        onExport: item => {
            // called when any content is exported
            console.log(`Exported: ${item.title} | ${item.type}`);
        }
    });

    // data contains entire project content
    const data = await exportService.exportAllAsync();

    // you can also save backup in file with ZipService
    const zipService = new ZipService({
        filename: 'file',
        enableLog: true
    });

    await zipService.createZipAsync(data);
};

run();
