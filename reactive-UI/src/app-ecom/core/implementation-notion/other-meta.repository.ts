import { Client } from "@notionhq/client";
import { IOtherMetaRespository } from "../contracts/other-meta.repository.interface";
import { IConfiguration } from "../contracts/configuration.interface";
import { OtherMeta } from "../contracts/other-meta.model";
import { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse, DatabaseObjectResponse, SelectPropertyItemObjectResponse, NumberPropertyItemObjectResponse, DatePropertyItemObjectResponse, MultiSelectPropertyItemObjectResponse, TitlePropertyItemObjectResponse, ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getPropertyDataTypes, getPropertyDescriptions } from "../../../utilities/property-extractor/description-extractor";

export class OtherMetaRepository implements IOtherMetaRespository {
   static PropertyNameDisabled: string = 'disabled';

   constructor(private _notionClient: Client, private _config: IConfiguration) {
      
   }

   public async getAllAsync(): Promise<OtherMeta[]> {
      const pagingRecords = await this._notionClient.databases.query({
         database_id: this._config.notion_MetaTableId,
         filter: {
           property: OtherMetaRepository.PropertyNameDisabled,
           checkbox: {
             equals: false
           },
         },
       });
      
      return await Promise.all(pagingRecords.results.map((p) => this._mapToBusinessModelAsync(p)));
   }

   private async _mapToBusinessModelAsync(x: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse) {
      const ans = new OtherMeta();
      const dataTypes = getPropertyDataTypes(ans);
      const notionColumnNames = getPropertyDescriptions(ans);

      for (let property of (Object.keys(ans) as [keyof OtherMeta])) {
         ans[property] = await this._fromNotionPropertyAsync(x, dataTypes[property], notionColumnNames[property]);
      }
      return ans;
  }

   private async _fromNotionPropertyAsync(searchResult: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse, columnType: string, columnName: string) {
      // @ts-ignore
      const allProperties = searchResult.properties;
      switch (columnType) {
         case 'Title': 
            // @ts-ignore notion hq is not up to date?
            return (allProperties[columnName] as TitlePropertyItemObjectResponse).title[0]?.plain_text ?? "";
         case 'FirstLineOFContent':
            const pageDetail = await this._notionClient.blocks.children.list({block_id: searchResult.id, page_size: 50});
            return (pageDetail.results[0] as ParagraphBlockObjectResponse)?.paragraph.rich_text[0]?.plain_text ?? '';
         default:
            return '';
      }
   }
}
