import { AssetContracts } from '@kentico/kontent-management';
import * as fs from 'fs';
import { get } from 'https';
import JSZip = require('jszip');

import { IExportData, IExportMetadata } from '../export';
import { IBinaryFile, IImportSource } from '../import';
import { IZipServiceConfig } from './zip.models';

export class ZipService {
    private readonly zipExtension: string = '.zip';

    private readonly contentTypesName: string = 'contentTypes.json';
    private readonly contentItemsName: string = 'contentItems.json';
    private readonly taxonomiesName: string = 'taxonomies.json';
    private readonly assetsName: string = 'assets.json';
    private readonly languageVariantsName: string = 'languageVariants.json';
    private readonly contentTypeSnippets: string = 'contentTypesSnippets.json';
    private readonly metadataName: string = 'metadata.json';
    private readonly languages: string = 'languages.json';
    private readonly assetsFolderName: string = 'files.json';

    private readonly filenameWithExtension: string;

    constructor(config: IZipServiceConfig) {
        this.filenameWithExtension = config.filename + this.zipExtension;
    }

    public async extractZipAsync(): Promise<IImportSource> {
        const file = await fs.promises.readFile(`./${this.filenameWithExtension}`);
        const unzippedFile = await JSZip.loadAsync(file);
        const assets = await this.readAndParseJsonFile(unzippedFile, this.assetsName);

        return {
            importData: {
                assets,
                contentTypes: await this.readAndParseJsonFile(unzippedFile, this.contentTypesName),
                languageVariants: await this.readAndParseJsonFile(unzippedFile, this.languageVariantsName),
                languages: await this.readAndParseJsonFile(unzippedFile, this.languages),
                contentItems: await this.readAndParseJsonFile(unzippedFile, this.contentItemsName),
                contentTypeSnippets: await this.readAndParseJsonFile(unzippedFile, this.contentTypeSnippets),
                taxonomies: await this.readAndParseJsonFile(unzippedFile, this.taxonomiesName),
            },
            binaryFiles: await this.extractBinaryFilesAsync(unzippedFile, assets)
        };
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
        zip.file(this.contentTypeSnippets, JSON.stringify(exportData.contentTypeSnippets));

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

    private async extractBinaryFilesAsync(
        zip: JSZip,
        assets: AssetContracts.IAssetModelContract[]
    ): Promise<IBinaryFile[]> {
        const binaryFiles: IBinaryFile[] = [];

        const files = zip.files;

        for (const asset of assets) {
            const assetFile = files[this.getFullAssetPath(asset.id, asset.file_name)];

            const binaryData = await assetFile.async('nodebuffer');
            binaryFiles.push({
                asset,
                binaryData
            });
        }

        return binaryFiles;
    }

    private getFullAssetPath(assetId: string, filename: string): string {
        return `${this.assetsFolderName}/${assetId.substr(0, 3)}/${assetId}/${filename}`;
    }

    private async readAndParseJsonFile(fileContents: any, filename: string): Promise<any> {
        const files = fileContents.files;
        const file = files[filename];

        if (!file) {
            throw Error(`Invalid file '${filename}'`);
        }

        const text = await file.async('text');

        return JSON.parse(text);
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
