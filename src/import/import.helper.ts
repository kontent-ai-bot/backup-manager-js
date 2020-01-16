import { codenameTranslateHelper } from '../core';
import { IExportData } from '../export';
import { IImportData, IPreparedImportItem, IImportSource } from './import.models';

export class ImportHelper {
    public prepareImportData(sourceData: IImportSource): IImportData {
        // translate internal ids to codenames
        codenameTranslateHelper.replaceIdReferencesWithCodenames(sourceData.importData, sourceData.importData);

        // flatten data
        const items = this.flattenSourceData(sourceData);

        return {
            orderedImportItems: items,
            binaryFiles: sourceData.binaryFiles,
            assetFolders: sourceData.assetFolders
        };
    }

    private orderItemsByDeps(items: IPreparedImportItem[]): IPreparedImportItem[] {
        for (const item of items) {
            // set deps of item
            item.deps.push(...this.getDependenciesOfItem(item, items));
        }

        const sortedItems = items.sort((a, b) => {
            if (a.codename === b.codename) {
                return 0;
            }

            // order items so that dependent items are first
            if (a.deps.includes(b.codename)) {
                return 1;
            } else {
                return -1;
            }
        });

        return sortedItems;
    }

    private getDependenciesOfItem(
        item: IPreparedImportItem,
        allItems: IPreparedImportItem[]
    ): string[] {
        const deps: string[] = [];

        // get referenced codenames in item
        codenameTranslateHelper.extractReferencedCodenames(item, allItems, deps);

        // filter codename of the item itself
        const filteredDeps = deps.filter(m => m !== item.codename);

        return filteredDeps;
    }

    private flattenSourceData(sourceData: IImportSource): IPreparedImportItem[] {
        return [
            ...sourceData.importData.taxonomies.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'taxonomy'
                };
            }),
            ...this.orderItemsByDeps(sourceData.importData.contentTypeSnippets.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'contentTypeSnippet'
                };
            })),
            ...this.orderItemsByDeps(sourceData.importData.contentTypes.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'contentType'
                };
            })),
            ...sourceData.importData.languages.map(m => {
                return <IPreparedImportItem> {
                    codename: m.id,
                    deps: [],
                    item: m,
                    type: 'language'
                };
            }),
            ...sourceData.importData.assets.map(m => {
                return <IPreparedImportItem> {
                    codename: m.id,
                    deps: [],
                    item: m,
                    type: 'asset'
                };
            }),
            ...sourceData.importData.contentItems.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'contentItem'
                };
            }),
            ...sourceData.importData.languageVariants.map(m => {
                return <IPreparedImportItem> {
                    codename: m.item.codename,
                    deps: [m.item.codename],
                    item: m,
                    type: 'languageVariant'
                };
            })
        ];
    }
}

export const importHelper = new ImportHelper();
