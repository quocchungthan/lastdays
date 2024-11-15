import { Client } from '@notionhq/client';
import { loadSecretConfiguration } from "./configuration";
import { EnglishWords } from "./words.entity";

// Loading configuration (Notion API keys, etc.)
const { notion_Token, notion_PageId } = loadSecretConfiguration();

export class EnglishWordStorageService {
    private notionClient: Client;

    constructor() {
        // Initialize the Notion client with the API key
        this.notionClient = new Client({ auth: notion_Token });
    }

    // Fetch the content from Notion and extract the required information
    async fetchAsync(): Promise<EnglishWords> {
        try {
            const pageId = notion_PageId; // Notion page ID from your secrets
            // Extract block content (you may need to use `blocks.children` API to get children)
            const contentBlocks = await this.getPageContent(pageId);

            const englishWords = new EnglishWords();
            englishWords.pureHtmlContent = this.extractHtmlContent(contentBlocks); // Extract HTML content
            englishWords.primitiveItems = this.extractBoldWords(contentBlocks); // Extract bolded words

            return englishWords;
        } catch (error) {
            console.error("Error fetching Notion page content:", error);
            throw error;
        }
    }

    // Fetch content blocks from a Notion page
    private async getPageContent(pageId: string): Promise<any[]> {
        try {
            // Retrieve all block content from a specific page
            const blockResponse = await this.notionClient.blocks.children.list({
                block_id: pageId
            });
            return blockResponse.results;
        } catch (error) {
            console.error("Error fetching page blocks:", error);
            throw error;
        }
    }

    // Extract bolded words from the content blocks
    private extractBoldWords(blocks: any[]): string[] {
        const boldWords: string[] = [];

        blocks.forEach(block => {
            // Check for paragraph blocks and extract bolded text
            if (block.type === "paragraph" && block.paragraph.rich_text) {
               // TODO: solve the type
                block.paragraph.rich_text.forEach((text: any) => {
                    if (text.annotations?.bold && text.text?.content) {
                        boldWords.push(text.text.content);
                    }
                });
            }
        });

        return boldWords;
    }

    // Extract HTML content (with <b> tags for bolded words)
    private extractHtmlContent(blocks: any[]): string {
        let htmlContent = "";

        blocks.forEach(block => {
            if (block.type === "paragraph" && block.paragraph.rich_text) {
               // TODO: solve the type
                block.paragraph.rich_text.forEach((text: any) => {
                    if (text.text?.content) {
                        // Wrap bolded text with <b> tag
                        if (text.annotations?.bold) {
                            htmlContent += `<b>${text.text.content}</b>`;
                        } else {
                            htmlContent += text.text.content;
                        }
                    }
                });
                htmlContent += "<br>"; // Add line break after each paragraph
            }
        });

        return htmlContent;
    }
}
