export function getFilenameWithoutExtension(filename: string): string {
    if (!filename) {
        throw Error(`Invalid filename`);
    }

    if (!filename.includes('.')) {
        return filename
    };

    return filename
        .split('.')
        .slice(0, -1)
        .join('.');
}
