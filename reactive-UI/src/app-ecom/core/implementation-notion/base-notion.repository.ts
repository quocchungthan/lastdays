import { Client } from "@notionhq/client";
import { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse, DatabaseObjectResponse, ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export abstract class BaseNotionRepository {
   constructor(private __notionClient: Client) {
      
   }
   protected async fromNotionPropertyAsync(searchResult: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, columnType: string, columnName: string) {
      // @ts-ignore
      const allProperties = searchResult.properties;
      switch (columnType) {
         case 'Title': 
            // @ts-ignore notion hq is not up to date?
            return (allProperties[columnName] as TitlePropertyItemObjectResponse).title[0]?.plain_text ?? "";
         case 'FirstLineOFContent':
            const pageDetail = await this.__notionClient.blocks.children.list({block_id: searchResult.id, page_size: 50});
            return (pageDetail.results[0] as ParagraphBlockObjectResponse)?.paragraph.rich_text[0]?.plain_text ?? '';
         default:
            return '';
      }
   }
}