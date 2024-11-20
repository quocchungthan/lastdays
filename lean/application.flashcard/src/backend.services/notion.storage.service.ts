import { loadSecretConfiguration } from "./configuration";
import { EnglishWords } from "./words.entity";
import { Request } from 'express';

// Loading configuration (Notion API keys, etc.)
const { Storage_AlPortalBaseUrl } = loadSecretConfiguration();

export class EnglishWordStorageService {
    private cache: { content: any; timestamp: number } | null = null;
    // TODO: now one instance perquest so it cannot be cached
    private readonly cacheExpirationTime = 15 * 60 * 1000; // 15 minutes in milliseconds

    constructor(private req: Request) {
    }

    // Fetch the content from Notion and extract the required information
    async fetchAsync(): Promise<EnglishWords> {
        // If the cache exists and is still valid, return cached data
        if (this.isCacheValid()) {
            console.log('Returning cached data');
            return this.cache!.content;
        }
        const fowardHeaders = this.buildFowardHeaders();
        const pages = await (await fetch(`${Storage_AlPortalBaseUrl}/api/portal/registered`, { headers: fowardHeaders})).json();
        const englishWords = new EnglishWords();

        for (let p of pages) {
            //notionClient = new Client({ auth: notion_Token });
            try {
                const pageId = p.id; // Notion page ID from your secrets
                // Extract block content (you may need to use `blocks.children` API to get children)
                const pageContent = await (await fetch(`${Storage_AlPortalBaseUrl}/api/portal/page/${pageId}/englishwords`, { headers: fowardHeaders})).json() as EnglishWords;
                englishWords.pureHtmlContent += pageContent.pureHtmlContent;
                englishWords.primitiveItems.push(...pageContent.primitiveItems);

                // Cache the result and store the current timestamp
                this.cache = {
                    content: englishWords,
                    timestamp: Date.now()
                };

            } catch (error) {
                console.error("Error fetching Notion page content:", error);
                throw error;
            }
        }

        englishWords.primitiveItems = [...new Set(englishWords.primitiveItems)];
        console.log(englishWords);
        return englishWords;
    }

    // Check if the cache is still valid (within the last 15 minutes)
    private isCacheValid(): boolean {
        if (!this.cache) {
            return false;
        }

        const currentTime = Date.now();
        return (currentTime - this.cache.timestamp) <= this.cacheExpirationTime;
    }
    
    private buildFowardHeaders() {
        const fowardHeaders = this._createHeaders();
        
        // Optionally, if you want to ensure x-forwarded-for is forwarded correctly
        // You can manually add or override the 'x-forwarded-for' header with the client's IP address
        // assuming that you are handling this on a backend (e.g., the browser doesn't directly expose client's IP)
        // TODO: ensure this is replicated with client-identity-service in notion-registration -> or build a common npm package.
        const clientIp = this.req.headers['x-forwarded-for'] as string || this.req.connection.remoteAddress || ''; // Replace this with a dynamic value if you have access to it
        fowardHeaders.set('x-forwarded-for', clientIp); // If needed, set or overwrite the x-forwarded-for header

        return fowardHeaders;
    }

    private _createHeaders(): Headers {
        const headers: Record<string, string> = Object.fromEntries(
          Object.entries(this.req.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : value ?? ''])
        );
    
        return new Headers(headers);
      }
}
