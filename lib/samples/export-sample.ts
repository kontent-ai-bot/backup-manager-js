import { ZipService } from 'lib/zip';

import { ExportService } from '../export';
import { FileService } from '../node';

const run = async () => {
    const fileService = new FileService({
        enableLog: true
    });

    const zipService = new ZipService({
        enableLog: true,
        context: 'node.js'
    });

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

    // prepare zip file
    const zipFile = await zipService.createZipAsync(data);

    // save zip to file system (node.js only)
    await fileService.writeFileAsync('filename', zipFile);

    await zipService.createZipAsync(data);
};

run();
