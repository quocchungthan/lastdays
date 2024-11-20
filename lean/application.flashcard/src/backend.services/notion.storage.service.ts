import { loadSecretConfiguration } from './configuration';
import { Request } from 'express';
import { EnglishWords } from '@cbto/nodepackages.utils/models/words.flashcard.model';
import { ALPortalPage } from '@cbto/nodepackages.utils/models/page.alportal.model';
import { ALPortalConfiguration } from '@cbto/nodepackages.utils/models/configuration.alportal.model';
import { ClientIdentityService } from '@cbto/nodepackages.utils/backend-functions/client-identity.service';
import { CacheService } from './cache.service';

// Loading configuration (Notion API keys, etc.)
const { Storage_AlPortalBaseUrl } = loadSecretConfiguration();

export class EnglishWordStorageService {
  constructor(private req: Request, private cacheService: CacheService) {}

  // Fetch the content from Notion and extract the required information
  async fetchAsync(): Promise<EnglishWords> {
    if (!(await this._isNotionServiceAvailable())) {
        return this._createMockEnglishWords();
    }
    // If the cache exists and is still valid, return cached data
    if (this.cacheService.isCacheValid("EnglishWordStorageService")) {
      console.log('Returning cached data');
      return this.cacheService.getCache("EnglishWordStorageService");
    }
    const fowardHeaders = this.buildFowardHeaders();
    const pages = await (
      await fetch(`${Storage_AlPortalBaseUrl}/api/portal/registered`, {
        headers: fowardHeaders,
      })
    ).json() as ALPortalPage[];
    const englishWords = new EnglishWords();

    for (let p of pages) {
      //notionClient = new Client({ auth: notion_Token });
      try {
        const pageId = p.id; // Notion page ID from your secrets
        // Extract block content (you may need to use `blocks.children` API to get children)
        const pageContent = (await (
          await fetch(
            `${Storage_AlPortalBaseUrl}/api/portal/page/${pageId}/englishwords`,
            { headers: fowardHeaders }
          )
        ).json()) as EnglishWords;
        englishWords.pureHtmlContent += pageContent.pureHtmlContent;
        englishWords.primitiveItems.push(...pageContent.primitiveItems);

        // Cache the result and store the current timestamp
        this.cacheService.setCache("EnglishWordStorageService", englishWords);
      } catch (error) {
        console.error('Error fetching Notion page content:', error);
        throw error;
      }
    }

    englishWords.primitiveItems = [...new Set(englishWords.primitiveItems)];
    console.log(englishWords);
    return englishWords;
  }

  private buildFowardHeaders() {
    const fowardHeaders = this._createHeaders();

    // Optionally, if you want to ensure x-forwarded-for is forwarded correctly
    // You can manually add or override the 'x-forwarded-for' header with the client's IP address
    // assuming that you are handling this on a backend (e.g., the browser doesn't directly expose client's IP)
    const clientIp = new ClientIdentityService(this.req).getUserIdentity(); // Replace this with a dynamic value if you have access to it
    fowardHeaders.set('x-forwarded-for', clientIp); // If needed, set or overwrite the x-forwarded-for header

    return fowardHeaders;
  }

  private _createHeaders(): Headers {
    const headers: Record<string, string> = Object.fromEntries(
      Object.entries(this.req.headers).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(', ') : value ?? '',
      ])
    );

    return new Headers(headers);
  }

    // Generate pure HTML content for the words data
    private _generatePureHtmlContent(words: any[]): string {
        let htmlContent = '<div>';
        words.forEach(wordData => {
            htmlContent += `
                <div class="word-item">
                    <h3>${wordData.word}</h3>
                    <p><strong>Pronunciation:</strong> ${wordData.pronunciation}</p>
                    <p><strong>Explanation:</strong> ${wordData.explanation}</p>
                </div>
            `;
        });
        htmlContent += '</div>';
        return htmlContent;
    }

    // Create and return the mock EnglishWords entity
    private _createMockEnglishWords(): EnglishWords {
        const wordsData: any[] = [
            { word: 'abandon', pronunciation: '/əˈbandən/', explanation: 'To leave behind or give up something or someone.' },
            { word: 'benevolent', pronunciation: '/bəˈnevələnt/', explanation: 'Showing kindness or goodwill.' },
            { word: 'catalyst', pronunciation: '/ˈkatəˌlɪst/', explanation: 'A substance that increases the rate of a chemical reaction, or a person or thing that causes a change.' },
            { word: 'diligent', pronunciation: '/ˈdɪlɪdʒənt/', explanation: 'Having or showing care and conscientiousness in one’s work or duties.' },
            { word: 'eloquent', pronunciation: '/ˈɛləkwənt/', explanation: 'Fluent or persuasive in speaking or writing.' },
            { word: 'facetious', pronunciation: '/fəˈsiːʃəs/', explanation: 'Treating serious issues with deliberately inappropriate humor.' },
        ];
        const englishWords = new EnglishWords();
        englishWords.pureHtmlContent = this._generatePureHtmlContent(wordsData);
        englishWords.primitiveItems = wordsData.map(word => word.word); // Extract just the words for important items
        return englishWords;
    }

  private async _isNotionServiceAvailable() {
    try {
      const fowardHeaders = this.buildFowardHeaders();
      const configuration = await (
        await fetch(`${Storage_AlPortalBaseUrl}/api/portal/configuration`, {
          headers: fowardHeaders,
        })
      ).json() as ALPortalConfiguration;
      return configuration.enabled ?? false;
    } catch (err) {
      console.log('Error at _isNotionServiceAvailable: ', err);
      return false;
    }
  }
}
