export type CliAction = 'backup' | 'restore' | 'clean';
export type ItemType = 'taxonomy' | 'contentType' | 'contentTypeSnippet';

export interface IProcessedItem {
    title: string;
    type: ItemType;
    data: any;
}
