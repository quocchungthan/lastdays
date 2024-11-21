export async function retryAPromise<T>(promise: () => Promise<T>): Promise<T> {
   try {
     return await promise();
   } catch {
     await sleepFor(500);
     return await retryAPromise(promise);
   }
}

async function sleepFor(ms: number) {
 return new Promise<void>((res,) => {
   setTimeout(() => { res(); }, ms);
 });
}