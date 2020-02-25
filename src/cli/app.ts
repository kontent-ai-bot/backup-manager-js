#!/usr/bin/env node
import * as fs from 'fs';
import yargs = require('yargs');

import { CleanService } from '../clean';
import { ICliFileConfig, fileHelper } from '../core';
import { ExportService, IExportAllResult } from '../export';
import { IImportSource, ImportService } from '../import';
import { ZipService } from '../zip';
import { ProjectContracts } from '@kentico/kontent-management';

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

    const report = await exportService.exportProjectValidationAsync();

    if (canExport(report, config)) {
        const response = await exportService.exportAllAsync();
        await zipService.createZipAsync(response);

        console.log('Completed');
    } else {
        const logFilename: string = 'backup_data_inconsistencies_log.json';

        await fileHelper.createFileInCurrentFolderAsync(logFilename, JSON.stringify(report));

        console.log(`Project could not be exported due to data inconsistencies.`);
        console.log(`A log file '${logFilename}' with issues was created in current folder.`);
        console.log(`To export data regardless of issues, set 'force' config parameter to true`);
    }
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

    console.log('Completed');
};

const restore = async (config: ICliFileConfig) => {
    const zipService = new ZipService({
        filename: config.zipFilename,
        enableLog: config.enableLog
    });

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

    const data = await zipService.extractZipAsync();

    if (canImport(data, config)) {
        await importService.importFromSourceAsync(data);

        console.log('Completed');
    } else {
        const logFilename: string = 'import_data_inconsistencies_log.json';

        await fileHelper.createFileInCurrentFolderAsync(logFilename, JSON.stringify(data.validation));

        console.log(`Project could not be imported due to data inconsistencies.`);
        console.log(`A log file '${logFilename}' with issues was created in current folder.`);
        console.log(`To import data regardless of issues, set 'force' config parameter to true`);
    }
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

const canExport = (projectReport: ProjectContracts.IProjectReportResponseContract, config: ICliFileConfig) => {
    const projectHasIssues = projectReport.variant_issues.length > 0 || projectReport.type_issues.length > 0;
    if (!projectHasIssues) {
        return true;
    }

    if (config.force === true) {
        return true;
    }

    return false;
};

const canImport = (importData: IImportSource, config: ICliFileConfig) => {
    if (!importData.metadata.isInconsistentExport) {
        return true;
    }

    if (config.force === true) {
        return true;
    }

    return false;
};

process();
