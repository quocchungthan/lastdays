import { loadSecretConfiguration } from "./configuration";
import { EnglishWords } from "./words.entity";

// Loading configuration (Notion API keys, etc.)
const { Storage_AlPortalBaseUrl } = loadSecretConfiguration();

export class EnglishWordStorageService {
    private cache: { content: any; timestamp: number } | null = null;
    private readonly cacheExpirationTime = 15 * 60 * 1000; // 15 minutes in milliseconds

    constructor() {
    }

    // Fetch the content from Notion and extract the required information
    async fetchAsync(): Promise<EnglishWords> {
        // If the cache exists and is still valid, return cached data
        if (this.isCacheValid()) {
            console.log('Returning cached data');
            return this.cache!.content;
        }

        const pages = await (await fetch(`${Storage_AlPortalBaseUrl}/api/portal/registered`)).json();
        const englishWords = new EnglishWords();

        for (let p of pages) {
            //notionClient = new Client({ auth: notion_Token });
            try {
                const pageId = p.id; // Notion page ID from your secrets
                // Extract block content (you may need to use `blocks.children` API to get children)
                const pageContent = await (await fetch(`${Storage_AlPortalBaseUrl}/api/portal/page/${pageId}/englishwords`)).json() as EnglishWords;
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
}
