export async function retryCreatingNewBoard<T>(promise: () => Promise<T>): Promise<T> {
   try {
     return await promise();
   } catch {
     await sleepFor(2000);
     return await retryCreatingNewBoard(promise);
   }
}

async function sleepFor(ms: number) {
 return new Promise<void>((res,) => {
   setTimeout(() => { res(); }, ms);
 });
}