export interface ITableClient<T> {
    getAll(): Promise<T[]>;
}