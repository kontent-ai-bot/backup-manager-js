import { CleanService } from 'src';

const run = async () => {
    const cleanService = new CleanService({
        onDelete: item => {
            // called when any content is deleted
            console.log(`Deleted: ${item.title} | ${item.type}`);
        },
        projectId: 'targetProjectId',
        apiKey: 'targetProjectApiKey'
    });

    await cleanService.cleanAllAsync();
};

run();
