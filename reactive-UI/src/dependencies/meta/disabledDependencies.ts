import { CachedResponse } from '@ai/model/CachedResponse.entity';
import { FilterParams, IBackupService } from './backup-storage.inteface';

export class DisabledStorage implements IBackupService<CachedResponse> {
    getAsync(andConjuction: FilterParams[]): Promise<CachedResponse | null> {
        return Promise.resolve(null);
    }

    storeAsync(entity: CachedResponse): Promise<CachedResponse> {
        return Promise.resolve(entity);
    }
}