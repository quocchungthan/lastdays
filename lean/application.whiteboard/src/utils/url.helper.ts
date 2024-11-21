export function getBoardId(url: string): string | null {
   const regex = /\/board\/([a-f0-9\-]{36})/;
   const match = url.match(regex);
   return match ? match[1] : null;
 }