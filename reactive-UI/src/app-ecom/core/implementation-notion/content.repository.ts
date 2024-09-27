import { Client } from "@notionhq/client";
import { IConfiguration } from "../contracts/configuration.interface";
import { Content } from "../contracts/content.model";
import { IContentRespository } from "../contracts/content.repository.interface";
import { getPropertyDataTypes, getPropertyDescriptions } from "../../../utilities/property-extractor/description-extractor";
import { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse, DatabaseObjectResponse, ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { BaseNotionRepository } from "./base-notion.repository";

export class ContentRepository extends BaseNotionRepository implements IContentRespository {
   constructor(private _notionClient: Client, private _config: IConfiguration) {
      super(_notionClient);
   }

   public async getContentByDescriptiveKeyAsync(contentTableId: string, key: string): Promise<Content> {
      const propertyName = getPropertyDescriptions(new Content())['descriptiveKey'];
      const pagingRecords = await this._notionClient.databases.query({
         database_id: contentTableId,
         filter: {
           property: propertyName,
           rich_text: {
             equals: key.toLowerCase()
           },
         },
       });

      const firstResult = pagingRecords.results[0];

      if (!firstResult) {
         throw Error("NOT_FOUND");
      }

      return await this._mapToBusinessModelAsync(firstResult);
   }

   private async _mapToBusinessModelAsync(x: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse) {
      const ans = new Content();
      const dataTypes = getPropertyDataTypes(ans);
      const notionColumnNames = getPropertyDescriptions(ans);

      for (let property of (Object.keys(ans) as [keyof Content])) {
         ans[property] = await this.fromNotionPropertyAsync(x, dataTypes[property], notionColumnNames[property]);
      }
      return ans;
  }
}
