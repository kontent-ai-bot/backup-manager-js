
import { ValidImportContract, ValidImportModel, IImportItemResult } from './core.models';

export class IdTranslateHelper {
    public replaceIdReferencesWithNewId(
        data: any,
        items: IImportItemResult<ValidImportContract, ValidImportModel>[]
    ): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferencesWithNewId(arrayItem, items);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;

                        const newId = this.tryFindNewId(id, items);

                        // replace old id with new
                        if (newId) {
                            data.id = newId;
                        }
                    }

                    if (key !== '0') {
                        this.replaceIdReferencesWithNewId(val, items);
                    }
                }
            }
        }
    }

    private tryFindNewId(
        id: string,
        items: IImportItemResult<ValidImportContract, ValidImportModel>[]
    ): string | undefined {
        const item = items.find(m => m.originalId === id);
        return item?.importId;
    }
}

export const idTranslateHelper = new IdTranslateHelper();
