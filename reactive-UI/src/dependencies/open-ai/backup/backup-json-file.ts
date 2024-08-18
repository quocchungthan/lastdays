import fs from 'fs';
import { CachedResponse } from '@ai/model/CachedResponse.entity'; // Ensure this path is correct based on your project structure
import { Condition, FilterParams, IBackupService } from '../../meta/backup-storage.inteface';
import { loadSecretConfiguration } from '../../meta/configuration.serve';

const { jsonBackupPath } = loadSecretConfiguration();
const DATA_FILE_PATH = jsonBackupPath;

export class BackupWithJsonFileService implements IBackupService<CachedResponse> {
    async storeAsync(entity: CachedResponse): Promise<CachedResponse> {
        let data: CachedResponse[] = [];

        // Read existing data
        if (fs.existsSync(DATA_FILE_PATH)) {
            const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
            data = JSON.parse(fileData);
        }

        data.push(entity); // Add new entry

        // Write data to file
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
        return entity;
    }

    async getAsync(andConjuction: FilterParams[]): Promise<CachedResponse | null> {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            return null;
        }

        const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        let data: CachedResponse[] = JSON.parse(fileData);

        // Filtering logic
        for (const param of andConjuction) {
            data = data.filter(item => {
                switch (param.condition) {
                    case Condition.EQUAL:
                        // @ts-ignore
                        return item[param.fieldName] === param.value;
                    default:
                        throw new Error(`Unsupported condition: ${param.condition}`);
                }
            });
        }

        // Return the first match, or null if no matches
        return data.length > 0 ? data[0] : null;
    }

    async getAllAsync(): Promise<CachedResponse[]> {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            return [];
        }

        const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        return JSON.parse(fileData) as CachedResponse[];
    }
}

export default BackupWithJsonFileService;
