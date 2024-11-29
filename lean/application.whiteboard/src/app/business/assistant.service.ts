import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

declare type fn = (userPrompt: string) => void;

@Injectable({
   providedIn: 'root'
})
export class AssistantService {
   private _promptRequest = new Subject<fn>();

   requireUserPrompt(): Promise<string> {
      return new Promise<string>((res, rej) => {
         this._promptRequest.next(res);
      });
   }

   onPromptRequested() {
      return this._promptRequest.asObservable();
   }
}