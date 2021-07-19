import { ImportService } from 'lib';
import { ZipService } from '../zip';
import { FileService } from '../node';

const run = async () => {
    const zipService = new ZipService({
        enableLog: true,
        context: 'node.js'
    });

    const fileService = new FileService({
        enableLog: true
    });

    const importService = new ImportService({
        onImport: item => {
            // called when any content is imported
            console.log(`Imported: ${item.title} | ${item.type}`);
        },
        // be careful when filtering data to import because you might break data consistency.
        // for example, it might not be possible to import language variant without first importing content item and so on.
        canImport: {
            asset: (item) => {
                if(item.title.startsWith('_corporate')) {
                    // asset will be imported only if the title starts with "_corporate"
                    return true;
                }
                // otherwise asset will NOT be imported
                return false;
            },
            contentType: (item) => {
                if (item.codename === 'article') {
                    // content type will be imported only with its codename is 'article'
                    return true;
                }
                // all other types will be excluded from import
                return false;
            },
            assetFolder: item => true, // all folders will be imported
            contentItem: item => true, // all content items will be imported
            contentTypeSnippet: item => true, // all content type snippets will be imported
            language: item => true, // all languages will be imported
            languageVariant: item => true, // all language variants will be imported
            taxonomy: item => true,// all taxonomies will be imported
        },
        enablePublish: true, // when enables, previously published language variants will be published after restore (does not affect unpublished variants)
        projectId: 'targetProjectId',
        apiKey: 'targetProjectId',
        enableLog: true, // shows progress of immport in console
        fixLanguages: true, // backup manager will attempt to create missing languages & map existing languages
        workflowIdForImportedItems: '00000000-0000-0000-0000-000000000000' // id that items are assigned
    });

    // read file
    const file = fileService.loadFileAsync('fileName');

    // extract file
    const data = await zipService.extractZipAsync(file);

    // restore into target project
    await importService.importFromSourceAsync(data);
};

run();
