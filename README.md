[![npm version](https://badge.fury.io/js/%40kentico%2Fkontent-backup-manager.svg)](https://badge.fury.io/js/%40kentico%2Fkontent-backup-manager)
[![CircleCI](https://circleci.com/gh/Kentico/kontent-backup-manager-js.svg?style=svg)](https://circleci.com/gh/Kentico/kontent-backup-manager-js)

# Kontent Backup Manager

The purpose of this project is to backup & restore [Kentico Kontent](https://kontent.ai) projects. This project uses CM API to both get & restore data.

## Installation

Install package globally:

`npm i @kentico/kontent-backup-manager -g`

## Use via CLI

### Configuration

| Config          | Value                                                                                                               |
|-----------------|---------------------------------------------------------------------------------------------------------------------|
| **projectId**       | Id of Kentico Kontent project **(required)**                                                                            |
| **apiKey**           | Content management Api key **(required)**                                                                               |
| **action**           | Action. Possible values are: `restore` & `backup` & `clean` **(required)**                                              |
| zipFilename     | Name of zip used for export / restoring data. (e.g. 'kontent-backup').                                            |
| enableLog       | Indicates if default logging is enabled (useful to indicate progress)       
| force           | If enabled, project will we exported / restored even if there are data inconsistencies. Enabled by default. |
| baseUrl           | Custom base URL for Management API calls. |
| exportFilter           | Can be used to export only selected data types. Expects CSV of types. For example `contentType,language` will cause backup manager to export only content types & language data. List of data types can be found below. |

### Data types

* taxonomy
* contentType
* contentTypeSnippet
* contentItem
* languageVariant
* language
* assetFolder
* binaryFile

### Execution

> We recommend restoring backups to clean (empty) projects. Restoration process may make changes to target project such as changing language codenames to match source project.

To backup a project run:

`kbm --action=backup --apiKey=xxx --projectId=xxx`

To restore a project run:

`kbm --action=restore --apiKey=xxx --projectId=xxx --zipFilename=backupFile`

To clean (delete) everything inside a project run:

`kbm --action=clean --apiKey=xxx --projectId=xxx`

### Use with config file

Create a `json` configuration file in the folder where you are attempting to run script. (e.g. `backup-config.json`)

```json
{
    "projectId": "xxx",
    "apiKey": "xxx",
    "zipFilename": "backup",
    "action": "backup",
    "enableLog": true,
    "force": true,
    "baseUrl": null,
    "exportFilter: null
}
```

To execute your action run: 

`kbm --config=backup-config.json`

## Use via code

### Backup in code

```typescript
const run = async () => {
    const exportService = new ExportService({
        apiKey: 'sourceProjectApiKey',
        projectId: 'sourceProjectId',
        exportFilter: undefined,
        onExport: item => {
            // called when any content is exported
            console.log(`Exported: ${item.title} | ${item.type}`);
        }
    });

    // data contains entire project content
    const data = await exportService.exportAllAsync();

    // you can also save backup in file with ZipService
    const zipService = new ZipService({
        filename: 'file',
        context: 'node.js',
        enableLog: true
    });

    await zipService.createZipAsync(data);
};

run();
```

### Restore in code

```typescript
const run = async () => {
    const zipService = new ZipService({
        filename: 'xxx',
        enableLog: true
    });

    const importService = new ImportService({
        onImport: item => {
            // called when any content is imported
            console.log(`Imported: ${item.title} | ${item.type}`);
        },
        fixLanguages: true,
        projectId: 'targetProjectId',
        apiKey: 'targetProjectId',
        enableLog: true,
        workflowIdForImportedItems: '00000000-0000-0000-0000-000000000000' // workflow id that items are assigned
    });

    // read export data from zip
    const data = await zipService.extractZipAsync();

    // restore into target project
    await importService.importFromSourceAsync(data);
};

run();
```

### Clean in code

```typescript
const run = async () => {
    const zipService = new ZipService({
        filename: 'xxx',
        enableLog: true
    });

    const importService = new ImportService({
        onDelete: item => {
            // called when any content is deleted
            console.log(`Deleted: ${item.title} | ${item.type}`);
        },
        fixLanguages: true,
        projectId: 'targetProjectId',
        apiKey: 'targetProjectId',
        enableLog: true
    });

    // read export data from zip
    const data = await zipService.extractZipAsync();

    // restore into target project
    await importService.importFromSourceAsync(data);
};

run();
```
