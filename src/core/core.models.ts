import { ContentTypeModels, ContentTypeSnippetModels, TaxonomyModels } from '@kentico/kontent-management';

export type CliAction = 'backup' | 'restore' | 'clean';
export type ItemType = 'taxonomy' | 'contentType' | 'contentTypeSnippet';
export type ValidImportType =
    | ContentTypeModels.ContentType
    | TaxonomyModels.Taxonomy
    | ContentTypeSnippetModels.ContentTypeSnippet;

export interface IProcessedItem {
    title: string;
    type: ItemType;
    data: any;
}
