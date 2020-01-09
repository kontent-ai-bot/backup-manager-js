import { IManagementClient, ManagementClient } from '@kentico/kontent-management';

import { ICleanConfig, ICleanResult } from './clean.models';
import { ItemType } from '../core';

export class CleanService {
    private readonly client: IManagementClient;

    constructor(private config: ICleanConfig) {
        this.client = new ManagementClient({
            apiKey: config.apiKey,
            projectId: config.projectId
        });
    }

    public async cleanAllAsync(): Promise<ICleanResult> {
        await this.cleanContentTypesAsync();
        await this.cleanContentTypeSnippetsAsync();
        await this.cleanTaxonomiesAsync();

        return {
            metadata: {
                projectId: this.config.projectId,
                timestamp: new Date()
            }
        };
    }

    public async cleanTaxonomiesAsync(): Promise<void> {
        const taxonomies = (await this.client.listTaxonomies().toPromise()).data.taxonomies;

        for (const taxonomy of taxonomies) {
            await this.client
                .deleteTaxonomy()
                .byTaxonomyId(taxonomy.id)
                .toPromise()
                .then(m => {
                    this.processItem(taxonomy.name, 'taxonomy', taxonomy);
                })
                .catch(error => this.handleCleanError(error));
        }
    }

    public async cleanContentTypeSnippetsAsync(): Promise<void> {
        const contentTypeSnippets = (await this.client.listContentTypeSnippets().toAllPromise()).data.items;

        for (const contentTypeSnippet of contentTypeSnippets) {
            await this.client
                .deleteContentTypeSnippet()
                .byTypeId(contentTypeSnippet.id)
                .toPromise()
                .then(m => {
                    this.processItem(contentTypeSnippet.name, 'contentTypeSnippet', contentTypeSnippet);
                })
                .catch(error => this.handleCleanError(error));
        }
    }

    public async cleanContentTypesAsync(): Promise<void> {
        const contentTypes = (await this.client.listContentTypes().toAllPromise()).data.items;

        for (const contentType of contentTypes) {
            await this.client
                .deleteContentType()
                .byTypeId(contentType.id)
                .toPromise()
                .then(m => {
                    this.processItem(contentType.name, 'contentType', contentType);
                })
                .catch(error => this.handleCleanError(error));
        }
    }

    private handleCleanError(error: any): void {
        console.log(error);
    }

    private processItem(title: string, type: ItemType, data: any): void {
        if (!this.config.processItem) {
            return;
        }

        this.config.processItem({
            data,
            title,
            type
        });
    }
}
