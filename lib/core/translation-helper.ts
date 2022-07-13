import { defaultObjectId } from './core-properties';
import { IIdCodenameTranslationResult } from './core.models';

export class TranslationHelper {
    public replaceIdReferencesWithExternalId(data: any): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferencesWithExternalId(arrayItem);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;

                        if (id) {
                            data.external_id = id;
                            delete data.id;
                        }
                    }

                    if (typeof val === 'object' && val !== null) {
                        this.replaceIdReferencesWithExternalId(val);
                    }
                }
            }
        }
    }

    public replaceIdReferencesWithCodenames(
        data: any,
        allData: any,
        storedCodenames: IIdCodenameTranslationResult,
        codenameForDefaultId?: string
    ): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferencesWithCodenames(arrayItem, allData, storedCodenames, codenameForDefaultId);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (!codename) {
                            let foundCodename: string | undefined;
                            if (id.toLowerCase() === defaultObjectId.toLowerCase() && codenameForDefaultId) {
                                foundCodename = codenameForDefaultId;
                            } else {
                                foundCodename = this.tryFindCodenameForId(id, allData, storedCodenames);
                            }

                            // replace id with codename
                            if (foundCodename) {
                                // remove id prop
                                delete data.id;

                                // set codename prop
                                data.codename = foundCodename;
                            }
                        }
                    }

                    if (typeof val === 'object' && val !== null) {
                        this.replaceIdReferencesWithCodenames(val, allData, storedCodenames, codenameForDefaultId);
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
                    let candidateId: string | undefined;

                    if (key.toLowerCase() === 'id') {
                        candidateId = (data as any).id;
                    }

                    if (key.toLocaleLowerCase() === 'external_id') {
                        candidateId = (data as any).external_id;
                    }

                    if (candidateId) {
                        const codename = (data as any).codename;

                        if (codename) {
                            // store id -> codename mapping so that we don't have to always
                            // search for it as its expensive operation
                            storedCodenames[candidateId] = codename;
                        }

                        if (codename && candidateId === findId) {
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

export const translationHelper = new TranslationHelper();
