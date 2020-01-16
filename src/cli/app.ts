#!/usr/bin/env node
import * as fs from 'fs';
import yargs = require('yargs');

import { CleanService } from '../clean';
import { ICliFileConfig } from '../core';
import { ExportService } from '../export';
import { ImportService } from '../import';
import { ZipService } from '../zip';

const argv = yargs.argv;

// config
const configFilename: string = argv.config as string;

if (!configFilename) {
    throw Error(`Please provide filename of config file using 'config' argument.`);
}

const backup = async (config: ICliFileConfig) => {
    const exportService = new ExportService({
        apiKey: config.apiKey,
        projectId: config.projectId,
        onExport: item => {
            if (config.enableLog) {
                console.log(`Exported: ${item.title} | ${item.type}`);
            }
        }
    });

    const zipService = new ZipService({
        filename: config.zipFilename,
        enableLog: config.enableLog
    });

    const response = await exportService.exportAllAsync();

    await zipService.createZipAsync(response.data, response.metadata);
};

const clean = async (config: ICliFileConfig) => {
    const cleanService = new CleanService({
        onDelete: item => {
            if (config.enableLog) {
                console.log(`Deleted: ${item.title} | ${item.type}`);
            }
        },
        projectId: config.projectId,
        apiKey: config.apiKey
    });

    await cleanService.cleanAllAsync();
};

const restore = async (config: ICliFileConfig) => {
    const zipService = new ZipService({
        filename: config.zipFilename,
        enableLog: config.enableLog
    });

    const data = await zipService.extractZipAsync();

    const importService = new ImportService({
        onImport: item => {
            if (config.enableLog) {
                console.log(`Imported: ${item.title} | ${item.type}`);
            }
        },
        projectId: config.projectId,
        apiKey: config.apiKey,
        enableLog: config.enableLog,
        workflowIdForImportedItems: '00000000-0000-0000-0000-000000000000',
        process: {
            language: item => config.importLanguages,
            contentItem: item => {
                return true;
            }
        }
    });

    await importService.importFromSourceAsync(data);
};

const validateConfig = (config: any) => {
    if (!config) {
        throw Error(`Invalid config file`);
    }

    const projectId = config.projectId;
    const apiKey = config.apiKey;
    const action = config.action;

    if (!projectId) {
        throw Error('Invalid project id');
    }

    if (!apiKey) {
        throw Error('Invalid api key');
    }

    if (!action) {
        throw Error('Invalid action');
    }
};

const process = async () => {
    const configFile = await fs.promises.readFile(`./${configFilename}`);

    const config = JSON.parse(configFile.toString()) as ICliFileConfig;

    validateConfig(config);

    if (config.action === 'backup') {
        backup(config);
    } else if (config.action === 'clean') {
        clean(config);
    } else if (config.action === 'restore') {
        restore(config);
    } else {
        throw Error(`Invalid action`);
    }
};

process();
