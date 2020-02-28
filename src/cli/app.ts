#!/usr/bin/env node
import * as fs from 'fs';
import yargs = require('yargs');

import { CleanService } from '../clean';
import { ICliFileConfig, fileHelper, CliAction } from '../core';
import { ExportService } from '../export';
import { IImportSource, ImportService } from '../import';
import { ZipService } from '../zip';
import { ProjectContracts } from '@kentico/kontent-management';

const argv = yargs.argv;

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
    const config = await getConfig();

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

const getConfig = async() => {
    const configFilename: string = argv.config as string;

    if (configFilename) {
        // get config from file
        const configFile = await fs.promises.readFile(`./${configFilename}`);

        return JSON.parse(configFile.toString()) as ICliFileConfig;
     }

     const action: CliAction | undefined = argv.action as CliAction | undefined;
     const apiKey: string | undefined = argv.apiKey as string | undefined;
     const enableLog: boolean | undefined = (argv.enableLog as boolean | undefined) ?? true;
     const force: boolean | undefined = (argv.force as boolean | undefined) ?? true;
     const importLanguages: boolean | undefined = (argv.importLanguages as boolean | undefined) ?? true;
     const projectId: string | undefined = argv.projectId as string | undefined;
     const zipFilename: string | undefined = (argv.zipFilename as string | undefined) ?? getDefaultBackupFilename()

     if (!action) {
         throw Error(`No action was provided`);
     }

     if (!apiKey) {
         throw Error(`Api key was not provided`);
     }

     if (!projectId) {
        throw Error(`Project id was not provided`);
    }

    // get config from command line
    const config: ICliFileConfig = {
        action,
        apiKey,
        enableLog,
        force,
        importLanguages,
        projectId,
        zipFilename
    };

    return config;
}

const getDefaultBackupFilename = () => {
    const date = new Date();
    return `kontent-backup-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;
}

process();
