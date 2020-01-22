import { IIdCodenameTranslationResult } from './core.models';

export class CodenameTranslateHelper {
    public replaceIdReferencesWithCodenames(
        data: any,
        allData: any,
        storedCodenames: IIdCodenameTranslationResult
    ): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferencesWithCodenames(arrayItem, allData, storedCodenames);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (!codename) {
                            // replace id with codename
                            const foundCodename = this.tryFindCodenameForId(id, allData, storedCodenames);

                            if (foundCodename) {
                                // remove id prop
                                delete data.id;

                                // set codename prop
                                data.codename = foundCodename;
                            }
                        }
                    }

                    if (typeof val === 'object' && val !== null) {
                        this.replaceIdReferencesWithCodenames(val, allData, storedCodenames);
                    }
                }
            }
        }
    }

    public extractReferencedCodenames(data: any, allData: any, foundCodenames: string[]): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.extractReferencedCodenames(arrayItem, allData, foundCodenames);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'codename') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (codename && !id) {
                            if (!foundCodenames.includes(codename)) {
                                foundCodenames.push(codename);
                            }
                        }
                    }
                    if (typeof val === 'object' && val !== null) {
                        this.extractReferencedCodenames(val, allData, foundCodenames);
                    }
                }
            }
        }
    }

    public tryFindCodenameForId(
        findId: string,
        data: any,
        storedCodenames: IIdCodenameTranslationResult,
        foundCodename?: string
    ): string | undefined {

        // try looking up codename in stored references
        const storedCodename = storedCodenames[findId];

        if (storedCodename) {
            return storedCodename;
        }

        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    foundCodename = this.tryFindCodenameForId(findId, arrayItem, storedCodenames, foundCodename);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (id && codename) {
                            // store id -> codename mapping so that we don't have to always
                            // search for it as its expensive operation
                            storedCodenames[id] = codename;
                        }

                        if (codename && id === findId) {
                            return codename;
                        }
                    }
                    if (typeof val === 'object' && val !== null) {
                        foundCodename = this.tryFindCodenameForId(findId, val, storedCodenames, foundCodename);
                    }
                }
            }
        }
        return foundCodename;
    }
}

export const codenameTranslateHelper = new CodenameTranslateHelper();
