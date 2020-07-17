#!/usr/bin/env node
import * as fs from 'fs';
import yargs = require('yargs');

import { CleanService } from '../../clean';
import { ICliFileConfig, getFilenameWithoutExtension, CliAction } from '../../core';
import { ExportService } from '../../export';
import { IImportSource, ImportService } from '../../import';
import { ZipService } from '../../zip';
import { ProjectContracts, SharedModels } from '@kentico/kontent-management';
import { FileService } from '../file/file.service';
import { fileHelper } from '../file/file-helper';

const argv = yargs.argv;

const backupAsync = async (config: ICliFileConfig) => {
    const exportService = new ExportService({
        apiKey: config.apiKey,
        projectId: config.projectId,
        baseUrl: config.baseUrl,
        onExport: (item) => {
            if (config.enableLog) {
                console.log(`Exported: ${item.title} | ${item.type}`);
            }
        }
    });

    const fileService = new FileService({
        enableLog: config.enableLog
    });

    const zipService = new ZipService({
        enableLog: config.enableLog,
        context: 'node.js'
    });

    const report = await exportService.exportProjectValidationAsync();

    const response = await exportService.exportAllAsync();
    const zipFileData = await zipService.createZipAsync(response);

    await fileService.writeFileAsync(config.zipFilename, zipFileData);

    if (exportContainsInconsistencies(report)) {
        const logFilename: string = getLogFilename(config.zipFilename);

        await fileHelper.createFileInCurrentFolderAsync(logFilename, JSON.stringify(report));

        console.log(`Project contains inconsistencies which may cause future import to not work.`);
        console.log(`See '${logFilename}' for more details.`);
    }

    console.log('Completed');
};

const getLogFilename = (filename: string) => {
    return `${getFilenameWithoutExtension(filename)}_log.json`;
};

const cleanAsync = async (config: ICliFileConfig) => {
    const cleanService = new CleanService({
        onDelete: (item) => {
            if (config.enableLog) {
                console.log(`Deleted: ${item.title} | ${item.type}`);
            }
        },
        baseUrl: config.baseUrl,
        projectId: config.projectId,
        apiKey: config.apiKey
    });

    await cleanService.cleanAllAsync();

    console.log('Completed');
};

const restoreAsync = async (config: ICliFileConfig) => {
    const zipService = new ZipService({
        enableLog: config.enableLog,
        context: 'node.js'
    });

    const fileService = new FileService({
        enableLog: config.enableLog
    });

    const importService = new ImportService({
        onImport: (item) => {
            if (config.enableLog) {
                console.log(`Imported: ${item.title} | ${item.type}`);
            }
        },
        baseUrl: config.baseUrl,
        fixLanguages: true,
        projectId: config.projectId,
        apiKey: config.apiKey,
        enableLog: config.enableLog,
        workflowIdForImportedItems: undefined,
        process: {
            contentItem: (item) => {
                return true;
            }
        }
    });

    const file = await fileService.loadFileAsync(config.zipFilename);

    const data = await zipService.extractZipAsync(file);

    if (canImport(data, config)) {
        await importService.importFromSourceAsync(data);

        console.log('Completed');
    } else {
        const logFilename: string = getLogFilename(config.zipFilename);

        await fileHelper.createFileInCurrentFolderAsync(logFilename, JSON.stringify(data.validation));

        console.log(`Project could not be imported due to data inconsistencies.`);
        console.log(`A log file '${logFilename}' with issues was created in current folder.`);
        console.log(`To import data regardless of issues, set 'force' config parameter to true`);
    }
};

const validateConfig = (config?: ICliFileConfig) => {
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
        await backupAsync(config);
    } else if (config.action === 'clean') {
        await cleanAsync(config);
    } else if (config.action === 'restore') {
        await restoreAsync(config);
    } else {
        throw Error(`Invalid action`);
    }
};

const exportContainsInconsistencies = (projectReport: ProjectContracts.IProjectReportResponseContract) => {
    if (projectReport.variant_issues.length > 0 || projectReport.type_issues.length > 0) {
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

const getConfig = async () => {
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
    const projectId: string | undefined = argv.projectId as string | undefined;
    const baseUrl: string | undefined = argv.baseUrl as string | undefined;
    const zipFilename: string | undefined = (argv.zipFilename as string | undefined) ?? getDefaultBackupFilename();

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
        projectId,
        zipFilename,
        baseUrl
    };

    return config;
};

const getDefaultBackupFilename = () => {
    const date = new Date();
    return `kontent-backup-${date.getDate()}-${
        date.getMonth() + 1
    }-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;
};

process()
    .then((m) => {})
    .catch((err) => {
        if (err instanceof SharedModels.ContentManagementBaseKontentError) {
            console.log(`Management API error occured:`, err.message);
            for (const validationError of err.validationErrors) {
                console.log(validationError.message);
            }
        } else {
            console.log(`There was an error processing your request: `, err);
        }
    });
