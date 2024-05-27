import { BaseEntity } from './entities/Base.entity';
import { cloneDeep } from 'lodash'
import guid from 'guid'

export abstract class CrudBaseService<T extends BaseEntity> {
    private _store = new Array<T>();

    index(): Promise<T[]> {
        return Promise.resolve(cloneDeep(this._store));
    }

    delete(id: string): Promise<void> {
        this._store = this._store.filter(x => x.id === id);
        return Promise.resolve();
    }

    create(model: T): Promise<T> {
        model = cloneDeep(model);
        if (!model.id) {
            model.id = '' + guid.create();
        }

        this._store.push(model);

        return Promise.resolve(cloneDeep(this._store[this._store.length - 1]));
    }

    update(model: T): Promise<T> {
        const findIndex = this._store.findIndex(x => x.id === model.id);
        this._store[findIndex] = model;
        return Promise.resolve(cloneDeep(this._store[findIndex]));
    }
}