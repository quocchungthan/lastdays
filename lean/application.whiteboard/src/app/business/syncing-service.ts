import { Injectable } from "@angular/core";
import { BrowserService } from "../services/browser.service";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";

@Injectable({
   providedIn: 'root'
})
export class SyncingService {
   constructor(private _browserService: BrowserService) {
   }

   storeEventAsync(event: IEventGeneral) {
      return this._browserService.storeEventAsync(event);
   }
}