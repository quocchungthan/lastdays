import { Client } from "@notionhq/client";
import { IOtherMetaRespository } from "../contracts/other-meta.repository.interface";
import { IConfiguration } from "../contracts/configuration.interface";
import { OtherMeta } from "../contracts/other-meta.model";
import { PageObjectResponse, PartialPageObjectResponse, PartialDatabaseObjectResponse, DatabaseObjectResponse, SelectPropertyItemObjectResponse, NumberPropertyItemObjectResponse, DatePropertyItemObjectResponse, MultiSelectPropertyItemObjectResponse, TitlePropertyItemObjectResponse } from "@notionhq/client/build/src/api-endpoints";
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
      
      return pagingRecords.results.map((p) => this._mapToBusinessModel(p))
   }

   private _mapToBusinessModel(x: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse): OtherMeta {
      const ans = new OtherMeta();
      // @ts-ignore
      const properties = x.properties;

      const dataTypes = getPropertyDataTypes(ans);
      const notionColumnNames = getPropertyDescriptions(ans);

      (Object.keys(ans) as [keyof OtherMeta]).forEach(property => {
         ans[property] = this._fromNotionProperty(properties, dataTypes[property], notionColumnNames[property]);
      });    
      return ans;
  }

   private _fromNotionProperty(allProperties: any, columnType: string, columnName: string): string {
      switch (columnType) {
         case 'Title': 
            // @ts-ignore notion hq is not up to date?
            return (allProperties[columnName] as TitlePropertyItemObjectResponse).title[0]?.plain_text ?? "";
         case 'Content':
            console.log(allProperties[columnName]);
            return '';
         default:
            return '';
      }
   }
}
