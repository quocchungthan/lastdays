import { CachedResponse } from '@ai/model/CachedResponse.entity';
import { FilterParams, IBackupService } from '../../meta/backup-storage.inteface';

export class BackupMongoDb implements IBackupService<CachedResponse> {
    storeAsync(entity: CachedResponse): Promise<CachedResponse> {
        return Promise.resolve(entity);
    }

    getAsync(andConjuction: FilterParams[]): Promise<CachedResponse | null> {
        return Promise.resolve(null);
    }
}