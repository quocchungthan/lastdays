// CacheService.ts

class CacheService {
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheExpirationTime: number;

  constructor() {
    // Initialize cache as an empty Map
    this.cache = new Map();
    // Cache expiration time (15 minutes = 900000 ms)
    this.cacheExpirationTime = 15 * 60 * 1000;
  }

  // Method to check if cache exists and is valid (not expired)
  public isCacheValid(cacheKey: string): boolean {
    const cachedData = this.cache.get(cacheKey);
    if (!cachedData) {
      return false;
    }

    const currentTime = Date.now();
    return currentTime - cachedData.timestamp < this.cacheExpirationTime;
  }

  // Method to get data from the cache
  public getCache(cacheKey: string): any | null {
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData.data;
    }
    return null;
  }

  // Method to set data in the cache
  public setCache(cacheKey: string, data: any): void {
    const timestamp = Date.now();
    this.cache.set(cacheKey, { data, timestamp });
  }
}

export { CacheService };
