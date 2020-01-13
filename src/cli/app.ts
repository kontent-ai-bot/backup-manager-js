#!/usr/bin/env node
import yargs = require('yargs');

import { CleanService } from '../clean';
import { CliAction } from '../core';
import { ExportService } from '../export';
import { ImportService } from '../import';
import { ZipService } from '../zip';

const argv = yargs.argv;

// config
const projectId: string = argv.projectId as string;
const action: string = argv.action as string;

if (!projectId) {
    throw Error(`Please provide project id using 'projectId' argument`);
}

if (!action) {
    throw Error(`Please provide action type using 'action' argument.`);
}

let mappedAction: CliAction;

if (action.toLowerCase() === 'backup') {
    mappedAction = 'backup';
} else if (action.toLowerCase() === 'restore') {
    mappedAction = 'restore';
} else if (action.toLowerCase() === 'clean') {
    mappedAction = 'clean';
} else {
    throw Error(`Unsupported action type '${action}'.`);
}



const exportService = new ExportService({
    apiKey: sourceApiKey,
    projectId: sourceProjectId
});

const importService = new ImportService({
    processItem: item => {
        console.log('imported item: ' + item.title);
    },
    projectId: targetProjectId,
    apiKey: targetApiKey,
    workflowIdForImportedItems: '00000000-0000-0000-0000-000000000000',
    skip: {
        languages: true
    }
});

const cleanService = new CleanService({
    processItem: item => {
        console.log('deleted item: ' + item.title);
    },
    projectId: targetProjectId,
    apiKey: targetApiKey
});

const zipService = new ZipService({
    filename: 'test'
});

const backup = async () => {
    const response = await exportService.exportAllAsync();

    await zipService.createZipAsync(response.data, response.metadata);

    /*
    codenameTranslateHelper.replaceIdReferencesWithCodenames(response.data, response.data);
    const zip = new JSZip();

    zip.file('test.json', JSON.stringify(response.data));
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.promises.writeFile(
        './processed.zip',
        content
    );
    */
};

const clean = async () => {
    await cleanService.cleanAllAsync();
};

const restore = async () => {
    // const response = await exportService.exportAllAsync();

    const data = await zipService.extractZipAsync();

    await importService.importFromSourceAsync(data);
};

if (mappedAction === 'backup') {
    backup();
}

if (mappedAction === 'clean') {
    clean();
}

if (mappedAction === 'restore') {
    restore();
}
