import { BaseEntity } from './entities/Base.entity';
import { cloneDeep } from 'lodash'
import guid from 'guid'

export abstract class CrudBaseService<T extends BaseEntity> {
    private _store = new Array<T>();
    private _tableName: string;

    constructor(x: new () => T) {
        this._tableName = "Table_" + x.name;
        const currentData = localStorage.getItem(this._tableName);
        this._store = currentData ? JSON.parse(currentData) : [];
    }

    index(): Promise<T[]> {
        return Promise.resolve(cloneDeep(this._store));
    }

    delete(id: string): Promise<void> {
        this._store = this._store.filter(x => x.id === id);
        this._cache();
        return Promise.resolve();
    }

    detail(id: string): Promise<T | undefined> {
        return Promise.resolve(cloneDeep(this._store.find(x => x.id === id)));
    }

    create(model: T): Promise<T> {
        model = cloneDeep(model);
        if (!model.id) {
            model.id = '' + guid.create();
        }

        this._store.push(model);
        this._cache();
        return Promise.resolve(cloneDeep(this._store[this._store.length - 1]));
    }

    update(model: T): Promise<T> {
        const findIndex = this._store.findIndex(x => x.id === model.id);
        this._store[findIndex] = model;
        this._cache();
        return Promise.resolve(cloneDeep(this._store[findIndex]));
    }

    private _cache() {
        localStorage.setItem(this._tableName, JSON.stringify(this._store));
    }
}