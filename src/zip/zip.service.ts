import * as fs from 'fs';
import { get } from 'https';
import JSZip = require('jszip');

import { IExportData, IExportMetadata } from '../export';
import { IZipServiceConfig } from './zip.models';

export class ZipService {
    private readonly zipExtension: string = '.zip';

    private readonly contentTypesName: string = 'contentTypes.json';
    private readonly contentItemsName: string = 'contentItems.json';
    private readonly taxonomiesName: string = 'taxonomies.json';
    private readonly assetsName: string = 'assets.json';
    private readonly languageVariantsName: string = 'languageVariants.json';
    private readonly metadataName: string = 'metadata.json';
    private readonly languages: string = 'languages.json';
    private readonly assetsFolderName: string = 'files.json';

    private readonly filenameWithExtension: string;

    constructor(config: IZipServiceConfig) {
        this.filenameWithExtension = config.filename + this.zipExtension;
    }

    public async createZipAsync(exportData: IExportData, metadata: IExportMetadata): Promise<void> {
        const zip = new JSZip();

        zip.file(this.contentTypesName, JSON.stringify(exportData.contentTypes));
        zip.file(this.contentItemsName, JSON.stringify(exportData.contentItems));
        zip.file(this.taxonomiesName, JSON.stringify(exportData.taxonomies));
        zip.file(this.assetsName, JSON.stringify(exportData.assets));
        zip.file(this.languageVariantsName, JSON.stringify(exportData.languageVariants));
        zip.file(this.metadataName, JSON.stringify(metadata));
        zip.file(this.languages, JSON.stringify(exportData.languages));

        const assetsFolder = zip.folder(this.assetsFolderName);

        for (const asset of exportData.assets) {
            const assetIdShortFolder = assetsFolder.folder(asset.id.substr(0, 3));
            const assetIdFolder = assetIdShortFolder.folder(asset.id);
            const assetFilename = asset.file_name;
            assetIdFolder.file(assetFilename, this.getBinaryDataFromUrl(asset.url), {
                binary: true
            });
        }

        const content = await zip.generateAsync({ type: 'nodebuffer' });

        await fs.promises.writeFile('./' + this.filenameWithExtension, content);
    }

    private getBinaryDataFromUrl(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            get(url, res => {
                const data: any[] = [];

                res.on('data', chunk => {
                    data.push(chunk);
                })
                    .on('end', () => {
                        const buffer = Buffer.concat(data);
                        resolve(buffer);
                    })
                    .on('error', error => {
                        reject(error);
                    });
            });
        });
    }
}
