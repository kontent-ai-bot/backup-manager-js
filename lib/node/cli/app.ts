#!/usr/bin/env node
import { readFileSync } from 'fs';
import * as yargs from 'yargs';

import { CleanService } from '../../clean';
import { ICliFileConfig, getFilenameWithoutExtension, CliAction, ItemType } from '../../core';
import { ExportService } from '../../export';
import { IImportSource, ImportService } from '../../import';
import { ZipService } from '../../zip';
import { ProjectContracts, SharedModels } from '@kentico/kontent-management';
import { FileService } from '../file/file.service';
import { fileHelper } from '../file/file-helper';

const argv = yargs(process.argv.slice(2))
    .example('kbm --action=backup --apiKey=xxx --projectId=xxx', 'Creates zip backup of Kontent project')
    .example(
        'kbm --action=restore --apiKey=xxx --projectId=xxx --zipFilename=backupFile',
        'Read given zip file and recreates data in Kontent project'
    )
    .example(
        'kbm --action=clean --apiKey=xxx --projectId=xxx',
        'Deletes data from given Kontent project. Use with care, this action is not reversible.'
    )
    .alias('p', 'projectId')
    .describe('p', 'ProjectId')
    .alias('k', 'apiKey')
    .describe('k', 'Management API Key')
    .alias('a', 'action')
    .describe('a', 'Action to perform. One of: backup, restore & clean')
    .alias('z', 'zipFilename')
    .describe('z', 'Name of zip used for export / restore')
    .alias('l', 'enableLog')
    .describe('l', 'Indicates if default logging is enabled (useful to indicate progress)')
    .alias('f', 'force')
    .describe(
        'f',
        'If enabled, project will we exported / restored even if there are data inconsistencies. Enabled by default.'
    )
    .alias('b', 'baseUrl')
    .describe('b', 'Custom base URL for Management API calls.')
    .alias('p', 'enablePublish')
    .describe(
        'p',
        'Indicates if language variants published on the source project are also published on target. Enabled by default'
    )
    .alias('e', 'exportFilter')
    .describe(
        'e',
        'Can be used to export only selected data types. Expects CSV of types. Supported types: taxonomy, contentType, contentTypeSnippet, contentItem, languageVariant, language, assetFolder, binaryFile & workflowSteps'
    )
    .help('h')
    .alias('h', 'help').argv;

const backupAsync = async (config: ICliFileConfig) => {
    const exportService = new ExportService({
        apiKey: config.apiKey,
        projectId: config.projectId,
        baseUrl: config.baseUrl,
        exportFilter: config.exportFilter,
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
        enablePublish: config.enablePublish,
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

const run = async () => {
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
    const resolvedArgs = await argv;
    const configFilename: string = (await resolvedArgs.config) as string;

    if (configFilename) {
        // get config from file
        const configFile = readFileSync(`./${configFilename}`);

        return JSON.parse(configFile.toString()) as ICliFileConfig;
    }

    const action: CliAction | undefined = resolvedArgs.action as CliAction | undefined;
    const apiKey: string | undefined = resolvedArgs.apiKey as string | undefined;
    const enableLog: boolean | undefined = (resolvedArgs.enableLog as boolean | undefined) ?? true;
    const force: boolean | undefined = (resolvedArgs.force as boolean | undefined) ?? true;
    const enablePublish: boolean | undefined = (resolvedArgs.enablePublish as boolean | undefined) ?? true;
    const projectId: string | undefined = resolvedArgs.projectId as string | undefined;
    const baseUrl: string | undefined = resolvedArgs.baseUrl as string | undefined;
    const zipFilename: string | undefined =
        (resolvedArgs.zipFilename as string | undefined) ?? getDefaultBackupFilename();
    const exportFilter: string | undefined = resolvedArgs.exportFilter as string | undefined;

    const exportFilterMapped: ItemType[] | undefined = exportFilter
        ? exportFilter
              .split(',')
              .map((m) => m.trim())
              .map((m) => {
                  return m as ItemType;
              })
        : undefined;

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
        enablePublish,
        action,
        apiKey,
        enableLog,
        force,
        projectId,
        zipFilename,
        baseUrl,
        exportFilter: exportFilterMapped
    };

    return config;
};

const getDefaultBackupFilename = () => {
    const date = new Date();
    return `kontent-backup-${date.getDate()}-${
        date.getMonth() + 1
    }-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;
};

run()
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
