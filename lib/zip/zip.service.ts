import { AssetContracts } from '@kentico/kontent-management';
import * as JSZip from 'jszip';
import axios, {} from 'axios';

import { IExportAllResult } from '../export';
import { IBinaryFile, IImportSource } from '../import';
import { IZipServiceConfig } from './zip.models';

export class ZipService {

    private readonly delayBetweenAssetRequestsMs: number;

    private readonly contentTypesName: string = 'contentTypes.json';
    private readonly contentItemsName: string = 'contentItems.json';
    private readonly taxonomiesName: string = 'taxonomies.json';
    private readonly assetsName: string = 'assets.json';
    private readonly languageVariantsName: string = 'languageVariants.json';
    private readonly contentTypeSnippetsName: string = 'contentTypesSnippets.json';
    private readonly metadataName: string = 'metadata.json';
    private readonly languages: string = 'languages.json';
    private readonly filesName: string = 'files';
    private readonly assetFoldersName: string = 'assetFolders.json';
    private readonly workflowStepsName: string = 'workflowSteps.json';
    private readonly validationName: string = 'validation.json';

    constructor(private config: IZipServiceConfig) {
        this.delayBetweenAssetRequestsMs = config?.delayBetweenAssetDownloadRequestsMs ?? 150;
    }

    public async extractZipAsync(zipFile: any): Promise<IImportSource> {
        if (this.config.enableLog) {
            console.log(`Unzipping file`);
        }

        const unzippedFile = await JSZip.loadAsync(zipFile);

        if (this.config.enableLog) {
            console.log(`Parsing zip contents`);
        }
        const assets = await this.readAndParseJsonFile(unzippedFile, this.assetsName);
        const result: IImportSource = {
            importData: {
                assets,
                contentTypes: await this.readAndParseJsonFile(unzippedFile, this.contentTypesName),
                languageVariants: await this.readAndParseJsonFile(unzippedFile, this.languageVariantsName),
                languages: await this.readAndParseJsonFile(unzippedFile, this.languages),
                contentItems: await this.readAndParseJsonFile(unzippedFile, this.contentItemsName),
                contentTypeSnippets: await this.readAndParseJsonFile(unzippedFile, this.contentTypeSnippetsName),
                taxonomies: await this.readAndParseJsonFile(unzippedFile, this.taxonomiesName),
                workflowSteps: await this.readAndParseJsonFile(unzippedFile, this.workflowStepsName),
            },
            assetFolders: await this.readAndParseJsonFile(unzippedFile, this.assetFoldersName),
            binaryFiles: await this.extractBinaryFilesAsync(unzippedFile, assets),
            validation: await this.readAndParseJsonFile(unzippedFile, this.validationName),
            metadata: await this.readAndParseJsonFile(unzippedFile, this.metadataName),
        };

        if (this.config.enableLog) {
            console.log(`Pasing zip completed`);
        }

        return result;
    }

    public async createZipAsync(exportData: IExportAllResult): Promise<any> {
        const zip = new JSZip();

        if (this.config.enableLog) {
            console.log(`Parsing json`);
        }

        zip.file(this.contentTypesName, JSON.stringify(exportData.data.contentTypes));
        zip.file(this.validationName, JSON.stringify(exportData.validation));
        zip.file(this.contentItemsName, JSON.stringify(exportData.data.contentItems));
        zip.file(this.taxonomiesName, JSON.stringify(exportData.data.taxonomies));
        zip.file(this.assetsName, JSON.stringify(exportData.data.assets));
        zip.file(this.languageVariantsName, JSON.stringify(exportData.data.languageVariants));
        zip.file(this.metadataName, JSON.stringify(exportData.metadata));
        zip.file(this.languages, JSON.stringify(exportData.data.languages));
        zip.file(this.contentTypeSnippetsName, JSON.stringify(exportData.data.contentTypeSnippets));
        zip.file(this.assetFoldersName, JSON.stringify(exportData.data.assetFolders));
        zip.file(this.workflowStepsName, JSON.stringify(exportData.data.workflowSteps));

        const assetsFolder = zip.folder(this.filesName);

        if (!assetsFolder) {
            throw Error(`Could not create folder '${this.filesName}'`);
        }

        if (this.config.enableLog) {
            console.log(`Adding assets to zip`);
        }

        for (const asset of exportData.data.assets) {
            const assetIdShortFolderName = asset.id.substr(0, 3);
            const assetIdShortFolder = assetsFolder.folder(assetIdShortFolderName);

            if (!assetIdShortFolder) {
                throw Error(`Could not create folder '${this.filesName}'`);
            }

            const assetIdFolderName = asset.id;
            const assetIdFolder = assetIdShortFolder.folder(assetIdFolderName);

            if (!assetIdFolder) {
                throw Error(`Could not create folder '${this.filesName}'`);
            }

            const assetFilename = asset.file_name;
            assetIdFolder.file(assetFilename, await this.getBinaryDataFromUrlAsync(asset.url, this.config.enableLog), {
                binary: true
            });

            // create artificial delay between requests as to prevent errors on network
            await this.sleepAsync(this.delayBetweenAssetRequestsMs);
        }

        if (this.config.enableLog) {
            console.log(`Creating zip file`);
        }

        const content = await zip.generateAsync({ type: this.getZipOutputType() });

        if (this.config.enableLog) {
            console.log(`Zip file prepared`);
        }

        return content;
    }

    private sleepAsync(ms: number): Promise<any> {
        return new Promise((resolve: any) => setTimeout(resolve, ms));
      }

    private async extractBinaryFilesAsync(
        zip: JSZip,
        assets: AssetContracts.IAssetModelContract[]
    ): Promise<IBinaryFile[]> {
        const binaryFiles: IBinaryFile[] = [];

        const files = zip.files;

        for (const asset of assets) {
            const assetFile = files[this.getFullAssetPath(asset.id, asset.file_name)];

            const binaryData = await assetFile.async(this.getZipOutputType());
            binaryFiles.push({
                asset,
                binaryData
            });
        }

        return binaryFiles;
    }

    private getZipOutputType(): 'nodebuffer' | 'blob' {
        if (this.config.context === 'browser') {
            return 'blob';
        }

        if (this.config.context === 'node.js') {
            return 'nodebuffer';
        }

        throw Error(`Unsupported context '${this.config.context}'`);
    }

    /**
     * Gets path to asset within zip folder. Uses tree format using asset ids such as:
     * "files/3b4/3b42f36c-2e67-4605-a8d3-fee2498e5224/image.jpg"
     */
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

    private getBinaryDataFromUrlAsync(url: string, enableLog: boolean): Promise<any> {
        // temp fix for Kontent Repository not validating url
        url = url.replace('#', '%23');

        if (enableLog) {
            console.log(`Start asset download: ${url}`);
        }
        return axios.get(url, {
            responseType: 'arraybuffer',
        }).then(
            response => {
                if (enableLog) {
                    console.log(`Completed asset download: ${url}`);
                }
                return response.data;
            }
        );
    }
}
