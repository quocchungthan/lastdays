import { SimpleChange } from '@angular/core';

type NonMethodKeys<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type ComponentNonMethods<T> = Pick<T, NonMethodKeys<T>>;

export type ExtendedSimpleChanges<TComponent> = {
    [K in keyof ComponentNonMethods<TComponent>]: SimpleChange;
};