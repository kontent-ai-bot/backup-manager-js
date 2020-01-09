#!/usr/bin/env node
import * as fs from 'fs';
import JSZip = require('jszip');
import yargs = require('yargs');

import { ExportService } from '../export';
import { CliAction, codenameTranslateHelper } from '../core';
import { ImportService } from '../import';
import { CleanService } from '../clean';

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
    processItem: (item) => {
        console.log('imported item: ' + item.title);
    },
    projectId: targetProjectId,
    apiKey: targetApiKey,
    skip: {
        languages: true
    }
});

const cleanService = new CleanService({
    processItem: (item) => {
        console.log('deleted item: ' + item.title);
    },
    projectId: targetProjectId,
    apiKey: targetApiKey
});

const backup = async () => {
    const filename = 'test.zip';

    const response = await exportService.exportAllAsync();
    const data = JSON.stringify(response);

    codenameTranslateHelper.replaceIdReferencesWithCodenames(response, response);
    const data2 = JSON.stringify(response);

    const zip = new JSZip();

    const dataFolder = zip.folder('data');

    dataFolder.file('test1.json', data);
    dataFolder.file('test2.json', data2);

    zip.generateAsync({ type: 'nodebuffer' }).then(content => {
        fs.writeFile('./' + filename, content, wError => {
            if (wError) {
                throw Error(`Could not create zip file`);
            }
            console.log(`Zip file generated`, mappedAction);
        });
    });

};

const clean = async () => {
    await cleanService.cleanAllAsync();
};

const restore = async () => {
    const response = await exportService.exportAllAsync();
    await importService.importFromExportDataAsync(response.data);
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
