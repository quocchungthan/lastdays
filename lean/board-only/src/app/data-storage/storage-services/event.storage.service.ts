import { Injectable } from "@angular/core";
import { DataStorageService } from "../../infrastructure.browser/datastorage.service";
import { ALEvent } from "../../common.definitions/local-entities/ALEvent";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventStorageService {
   constructor(private dataStorage: DataStorageService) {
   }

   index() {
      return this.dataStorage.getAllItemsOfTable('Event').then(x => x as ALEvent[]);
   }

   insert(item: ALEvent) {
      if (!item.id) {
         item.id = uuidv4();
      }
      if (!item.timestamp) {
         item.timestamp = new Date().toISOString();
      }

      return this.dataStorage.insertItem('Event', item)
         .then(x => x as ALEvent[])
         .then(x => x.sort((b, a) => this.getTime(a) - this.getTime(b))[0])
   }

   private getTime(a: ALEvent) {
      return new Date(a.timestamp).getTime();
   }
}