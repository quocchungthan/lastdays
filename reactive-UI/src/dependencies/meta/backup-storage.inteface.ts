import { CachedResponse } from '@ai/model/CachedResponse.entity';

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
    backup: () => IBackupService<CachedResponse>;
}