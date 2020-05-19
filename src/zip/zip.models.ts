export type ZipContext = 'node.js' | 'browser';

export interface IZipServiceConfig {
    enableLog: boolean;
    context: ZipContext
}
