#!/usr/bin/env node
import * as fs from 'fs';
import JSZip = require('jszip');
import yargs = require('yargs');

import { ExportService } from '../export';
import { CliAction } from '../models';
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

// tslint:disable-next-line: max-line-length
const sourceApiKey: string = '';
const sourceProjectId: string = 'b259760f-81c5-013a-05e7-69efb4b954e5';

// tslint:disable-next-line: max-line-length
const targetApiKey: string = '';
const targetProjectId: string = 'c0135fb2-af2f-01be-c387-d0c762c23301';

const exportService = new ExportService({
    apiKey: sourceApiKey,
    projectId: sourceProjectId
});

const importService = new ImportService({
    processItem: (item) => {
        console.log('imported item: ' + item.title);
    },
    projectId: targetProjectId,
     // tslint:disable-next-line: max-line-length
    apiKey: targetApiKey
});

const cleanService = new CleanService({
    processItem: (item) => {
        console.log('deleted item: ' + item.title);
    },
    projectId: targetProjectId,
     // tslint:disable-next-line: max-line-length
    apiKey: targetApiKey
});

const backup = async () => {
    const filename = 'test.zip';

    const response = await exportService.exportAllAsync();
    const data = JSON.stringify(response);

    const zip = new JSZip();

    const dataFolder = zip.folder('data');

    dataFolder.file('test1.json', data);
    dataFolder.file('test2.json', data);

    zip.generateAsync({ type: 'nodebuffer' }).then(content => {
        fs.writeFile('./' + filename, content, wError => {
            if (wError) {
                throw Error(`Could not create zip file`);
            }
            console.log(`Zip file generated`, mappedAction);
        });
    });

    await importService.importFromExportDataAsync(response.data);
};

const clean = async () => {
    await cleanService.cleanAllAsync();
};

const restore = async () => {
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
