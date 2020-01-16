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
    private readonly contentTypeSnippetsName: string = 'contentTypesSnippets.json';
    private readonly metadataName: string = 'metadata.json';
    private readonly languages: string = 'languages.json';
    private readonly filesName: string = 'files.json';
    private readonly assetFoldersName: string = 'assetFolders.json';

    private readonly filenameWithExtension: string;

    constructor(private config: IZipServiceConfig) {
        this.filenameWithExtension = config.filename + this.zipExtension;
    }

    public async extractZipAsync(): Promise<IImportSource> {
        const filePath = `./${this.filenameWithExtension}`;
        if (this.config.enableLog) {
            console.log(`Reading file '${filePath}'`);
        }
        const file = await fs.promises.readFile(filePath);

        if (this.config.enableLog) {
            console.log(`Unzipping file`);
        }
        const unzippedFile = await JSZip.loadAsync(file);

        if (this.config.enableLog) {
            console.log(`Parsing zip contents`);
        }
        const assets = await this.readAndParseJsonFile(unzippedFile, this.assetsName);

        return {
            importData: {
                assets,
                contentTypes: await this.readAndParseJsonFile(unzippedFile, this.contentTypesName),
                languageVariants: await this.readAndParseJsonFile(unzippedFile, this.languageVariantsName),
                languages: await this.readAndParseJsonFile(unzippedFile, this.languages),
                contentItems: await this.readAndParseJsonFile(unzippedFile, this.contentItemsName),
                contentTypeSnippets: await this.readAndParseJsonFile(unzippedFile, this.contentTypeSnippetsName),
                taxonomies: await this.readAndParseJsonFile(unzippedFile, this.taxonomiesName),
            },
            assetFolders: await this.readAndParseJsonFile(unzippedFile, this.assetFoldersName),
            binaryFiles: await this.extractBinaryFilesAsync(unzippedFile, assets)
        };
    }

    public async createZipAsync(exportData: IExportData, metadata: IExportMetadata): Promise<void> {
        const zip = new JSZip();

        if (this.config.enableLog) {
            console.log(`Parsing json`);
        }

        zip.file(this.contentTypesName, JSON.stringify(exportData.contentTypes));
        zip.file(this.contentItemsName, JSON.stringify(exportData.contentItems));
        zip.file(this.taxonomiesName, JSON.stringify(exportData.taxonomies));
        zip.file(this.assetsName, JSON.stringify(exportData.assets));
        zip.file(this.languageVariantsName, JSON.stringify(exportData.languageVariants));
        zip.file(this.metadataName, JSON.stringify(metadata));
        zip.file(this.languages, JSON.stringify(exportData.languages));
        zip.file(this.contentTypeSnippetsName, JSON.stringify(exportData.contentTypeSnippets));
        zip.file(this.assetFoldersName, JSON.stringify(exportData.assetFolders));

        const assetsFolder = zip.folder(this.filesName);

        if (this.config.enableLog) {
            console.log(`Adding assets to zip`);
        }

        for (const asset of exportData.assets) {
            const assetIdShortFolder = assetsFolder.folder(asset.id.substr(0, 3));
            const assetIdFolder = assetIdShortFolder.folder(asset.id);
            const assetFilename = asset.file_name;
            assetIdFolder.file(assetFilename, this.getBinaryDataFromUrl(asset.url, this.config.enableLog), {
                binary: true
            });
        }

        const filePath = './' + this.filenameWithExtension;

        if (this.config.enableLog) {
            console.log(`Generating zip file '${filePath}'`);
        }
        const content = await zip.generateAsync({ type: 'nodebuffer' });

        console.log(`Writing file '${filePath}'`);
        await fs.promises.writeFile(filePath, content);
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
        return `${this.filesName}/${assetId.substr(0, 3)}/${assetId}/${filename}`;
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

    private getBinaryDataFromUrl(url: string, enableLog: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            get(url, res => {
                if (enableLog) {
                    console.log(`Downloading asset: ${url}`);
                }
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
