import { CachedResponse } from '@ai/model/CachedResponse.entity';
import { ILogger } from '@com/connection.manager';

export enum Condition {
    EQUAL
}

export interface FilterParams {
    fieldName: string;
    condition: Condition;
    value: string;
}

export interface IBackupService<TEntity> {
    storeAsync(entity: TEntity): Promise<TEntity>;
    getAsync(andConjuction: FilterParams[]): Promise<TEntity | null>;
}


export interface IDependenciesPool {
    _logger: ILogger | undefined;
    _backupService: IBackupService<CachedResponse> | undefined;
    backup: () => IBackupService<CachedResponse>;
    logger: () => ILogger;
}