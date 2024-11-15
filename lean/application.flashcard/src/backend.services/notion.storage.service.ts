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
            englishWords.primitiveItems = this.extractBoldWords(englishWords.pureHtmlContent); // Extract bolded words

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

      // Extract bolded words from HTML content (using regex to match words inside <b> tags)
      private extractBoldWords(htmlContent: string): string[] {
         const boldWords: string[] = [];
         
         // Regex to match content between <b> and the first non-alphabet character
         const regex = /<b>([a-zA-Z\s]+)\W/g;
         let match;

         // Loop through all matches
         while ((match = regex.exec(htmlContent)) !== null) {
            const boldText = match[1].trim(); // Extracted bold word
            // Ensure the word is valid and alphabetic
            if (boldText) {
               boldWords.push(boldText);
            }
         }

         return boldWords;
      }

    private extractHtmlContent(blocks: any[]): string {
      let htmlContent = "";
  
      blocks.forEach(block => {
          // Handle different block types
          if (block.type === "paragraph" && block.paragraph.rich_text) {
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
          } else if (block.type === "bulleted_list_item" && block.bulleted_list_item.rich_text) {
              block.bulleted_list_item.rich_text.forEach((text: any) => {
                  if (text.text?.content) {
                      if (text.annotations?.bold) {
                          htmlContent += `<b>${text.text.content}</b>`;
                      } else {
                          htmlContent += text.text.content;
                      }
                  }
              });
              htmlContent += "<br>"; // Add line break after each bulleted item
          } else if (block.type === "numbered_list_item" && block.numbered_list_item.rich_text) {
              block.numbered_list_item.rich_text.forEach((text: any) => {
                  if (text.text?.content) {
                      if (text.annotations?.bold) {
                          htmlContent += `<b>${text.text.content}</b>`;
                      } else {
                          htmlContent += text.text.content;
                      }
                  }
              });
              htmlContent += "<br>"; // Add line break after each numbered item
          }
  
          // If the block has children (e.g., nested lists or other components), recurse through them
          if (block.has_children) {
              // Recursively extract HTML content from child blocks
              htmlContent += this.extractHtmlContent(block.children || []);
          }
      });
  
      return htmlContent;
  }
}
