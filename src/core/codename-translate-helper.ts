export class CodenameTranslateHelper {
    public replaceIdReferencesWithCodenames(data: any, allData: any): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferencesWithCodenames(arrayItem, allData);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (!codename) {
                            // replace id with codename
                            const foundCodename = this.tryFindCodenameForId(id, allData);

                            if (foundCodename) {
                                // remove id prop
                                delete data.id;

                                // set codename prop
                                data.codename = foundCodename;
                            }
                        }
                    }
                    if (key !== '0') {
                        this.replaceIdReferencesWithCodenames(val, allData);
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
                    if (key !== '0') {
                        this.extractReferencedCodenames(val, allData, foundCodenames);
                    }
                }
            }
        }
    }

    public tryFindCodenameForId(findId: string, data: any, foundCodename?: string): string | undefined {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    foundCodename = this.tryFindCodenameForId(findId, arrayItem, foundCodename);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (codename && id === findId) {
                            return codename;
                        }
                    }
                    if (key !== '0') {
                        foundCodename = this.tryFindCodenameForId(findId, val, foundCodename);
                    }
                }
            }
        }
        return foundCodename;
    }
}

export const codenameTranslateHelper = new CodenameTranslateHelper();
