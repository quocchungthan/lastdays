import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Dimension } from "../../share-models/Dimension";
import { Point } from "../../share-models/Point";
import { BrowserService } from "../services/browser.service";
import { getBoardId } from "../../utils/url.helper";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";

declare type fn = (userPrompt: string) => void;

@Injectable({
   providedIn: 'root'
})
export class AssistantService {
   private _promptRequest = new Subject<fn>();
   private _eventGenerated = new Subject<IEventGeneral>();
   private _threadId?: string;

   constructor(private http: HttpClient, private browserService: BrowserService) {
   }

   askForSuggestion(userPrompt: string, area: Point & Dimension) {
      // TODO: should be solved by environment.ts or process.env
      // TODO: repliacated model from helper.assistant:
      /**
       export interface SuggestionRequestBody {
         userPrompt: string;
         area: Point & Dimension;
         existingEvents: IEventGeneral[];
         threadId?: string;
      }
       */
      const boardId = getBoardId(location.href);

      return new Promise<IEventGeneral[]>(async (res, rej) => {
         if (!boardId) {
            rej("Error on extracting board id");

            return;
         }
         const events = await this.browserService.loadAllEventRelatedToBoardAsync(boardId);
         this.http.post(`http://localhost:4014/api/sm-assistant/suggestion`, {
            threadId: this._threadId,
            userPrompt,
            area,
            existingEvents: events
         }).subscribe((d) => {
            const data = d as { events: IEventGeneral[], threadId: string };
            data.events.forEach(e => {
               e.timestamp = new Date();
               this.browserService.storeEventAsync(e)
                  .then((insterted) => {
                     this._eventGenerated.next(e);
                  });
            });
            res([]);
         });
      });
   }

   onEventGenerated() {
      return this._eventGenerated.asObservable();
   }

   requireUserPrompt(): Promise<string> {
      return new Promise<string>((res, rej) => {
         this._promptRequest.next(res);
      });
   }

   onPromptRequested() {
      return this._promptRequest.asObservable();
   }
}