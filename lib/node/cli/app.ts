#!/usr/bin/env node
import { readFileSync } from 'fs';
import * as yargs from 'yargs';

import { CleanService } from '../../clean';
import { ICliFileConfig, CliAction, ItemType } from '../../core';
import { ExportService } from '../../export';
import { ImportService } from '../../import';
import { ZipService } from '../../zip';
import { SharedModels } from '@kontent-ai/management-sdk';
import { FileService } from '../file/file.service';
import { green, red, yellow } from 'colors';

const argv = yargs(process.argv.slice(2))
    .example('kbm --action=backup --apiKey=xxx --environmentId=xxx', 'Creates zip backup of Kontent.ai project')
    .example(
        'kbm --action=restore --apiKey=xxx --environmentId=xxx --zipFilename=backupFile',
        'Read given zip file and recreates data in Kontent.ai project'
    )
    .example(
        'kbm --action=clean --apiKey=xxx --environmentId=xxx',
        'Deletes data from given Kontent.ai project. Use with care, this action is not reversible.'
    )
    .alias('p', 'environmentId')
    .describe('p', 'EnvironmentId')
    .describe('sv', 'Skips validation endpoint during export')
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
    .alias('s', 'preserveWorkflow')
    .describe('s', 'Indicates if workflow information of language variants is preserved')
    .alias('e', 'exportFilter')
    .describe(
        'e',
        'Can be used to export only selected data types. Expects CSV of types. Supported types: taxonomy, contentType, contentTypeSnippet, contentItem, languageVariant, language, asset, assetFolder, binaryFile, workflow & collection'
    )
    .help('h')
    .alias('h', 'help').argv;

const backupAsync = async (config: ICliFileConfig) => {
    const exportService = new ExportService({
        apiKey: config.apiKey,
        environmentId: config.environmentId,
        baseUrl: config.baseUrl,
        exportFilter: config.exportFilter,
        onExport: (item) => {
            if (config.enableLog) {
                console.log(`Exported ${yellow(item.title)} (${green(item.type)})`);
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

    const response = await exportService.exportAllAsync();
    const zipFileData = await zipService.createZipAsync(response);

    await fileService.writeFileAsync(config.zipFilename, zipFileData);

    console.log(green('Completed'));
};

const cleanAsync = async (config: ICliFileConfig) => {
    const cleanService = new CleanService({
        onDelete: (item) => {
            if (config.enableLog) {
                console.log(`Deleted: ${yellow(item.title)}`);
            }
        },
        baseUrl: config.baseUrl,
        environmentId: config.environmentId,
        apiKey: config.apiKey
    });

    await cleanService.cleanAllAsync();

    console.log(green('Completed'));
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
                console.log(`Imported: ${yellow(item.title)} (${green(item.type)})`);
            }
        },
        preserveWorkflow: config.preserveWorkflow,
        baseUrl: config.baseUrl,
        fixLanguages: true,
        environmentId: config.environmentId,
        apiKey: config.apiKey,
        enableLog: config.enableLog,
        workflowIdForImportedItems: undefined,
        canImport: {
            contentItem: (item) => {
                return true;
            }
        }
    });

    const file = await fileService.loadFileAsync(config.zipFilename);

    const data = await zipService.extractZipAsync(file);

    await importService.importFromSourceAsync(data);

    console.log(green('Completed'));
};

const validateConfig = (config?: ICliFileConfig) => {
    if (!config) {
        throw Error(`Invalid config file`);
    }

    const environmentId = config.environmentId;
    const apiKey = config.apiKey;
    const action = config.action;

    if (!environmentId) {
        throw Error('Invalid environment id');
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
    const preserveWorkflow: boolean | undefined = (resolvedArgs.preserveWorkflow as boolean | undefined) ?? true;
    const environmentId: string | undefined = resolvedArgs.environmentId as string | undefined;
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

    if (!environmentId) {
        throw Error(`Project id was not provided`);
    }

    // get config from command line
    const config: ICliFileConfig = {
        preserveWorkflow,
        action,
        apiKey,
        enableLog,
        force,
        environmentId,
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
            console.log(`Management API error occured:`, red(err.message));
            for (const validationError of err.validationErrors) {
                console.log(validationError.message);
            }
        } else {
            console.log(`There was an error processing your request: `, red(err));
        }
    });
