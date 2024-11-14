import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

type TableNames = 'Event';

@Injectable()
export class DataStorageService {
   localStorage: Storage;

   constructor(@Inject(DOCUMENT) private document: Document) {
      this.localStorage = document.defaultView?.localStorage!;
   }

   getAllItemsOfTable(tableName: TableNames) {
      if (!this.localStorage) {
         return Promise.resolve([]);
      }
      return new Promise<any[]>((resolve) => {
         let existing = this.localStorage.getItem(this.constructKey(tableName));
         if (!existing) {
            this.localStorage.setItem(this.constructKey(tableName), '[]');
         }

         resolve(JSON.parse(localStorage.getItem(this.constructKey(tableName))!));
      });
   }

   async insertItem(tableName: TableNames, item: any) {
      if (!this.localStorage) {
         throw Error("Localstorage is undefined with no reason!!!");
      }

      const existing = await this.getAllItemsOfTable(tableName);
      existing.push(item);
      this.localStorage.setItem(this.constructKey(tableName), JSON.stringify(existing));

      return existing;
   }

   private constructKey(tableName: TableNames) {
      return 'LS_TABLE_' + tableName;
   }
}