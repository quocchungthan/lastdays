import { Observable } from 'rxjs';

export function subscriptionToPromise<T>(observable: Observable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const subscription = observable.subscribe({
            next: resolve,
            error: reject,
            complete: () => {
                // Optional: handle completion if needed
                // For this promise, resolve on the first emitted value
            },
        });

        // Cleanup subscription if the promise is rejected or resolved
        return () => subscription.unsubscribe();
    });
}