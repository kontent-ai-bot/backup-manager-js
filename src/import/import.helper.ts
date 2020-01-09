import { codenameTranslateHelper } from '../core';
import { IExportData } from '../export';
import { IImportData, IPreparedImportItem } from './import.models';

export class ImportHelper {
    public prepareImportData(exportData: IExportData): IImportData {
        // translate internal ids to codenames
        codenameTranslateHelper.replaceIdReferencesWithCodenames(exportData, exportData);

        // flatten data
        const items = this.flattenExportData(exportData);

        return {
            orderedImportItems: items
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

    private flattenExportData(exportData: IExportData): IPreparedImportItem[] {
        return [
            ...exportData.taxonomies.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'taxonomy'
                };
            }),
            ...this.orderItemsByDeps(exportData.contentTypeSnippets.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'contentTypeSnippet'
                };
            })),
            ...this.orderItemsByDeps(exportData.contentTypes.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'contentType'
                };
            })),
            ...exportData.languages.map(m => {
                return <IPreparedImportItem> {
                    codename: m.id,
                    deps: [],
                    item: m,
                    type: 'language'
                };
            }),
            ...exportData.assets.map(m => {
                return <IPreparedImportItem> {
                    codename: m.id,
                    deps: [],
                    item: m,
                    type: 'asset'
                };
            }),
            ...exportData.contentItems.map(m => {
                return <IPreparedImportItem> {
                    codename: m.codename,
                    deps: [],
                    item: m,
                    type: 'contentItem'
                };
            }),
            ...exportData.languageVariants.map(m => {
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
