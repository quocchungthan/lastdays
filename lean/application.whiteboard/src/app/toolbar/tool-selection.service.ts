import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
   providedIn: 'root'
})
export class ToolSelectionService {
   private _toolSelection = new BehaviorSubject<string>('default');

   get onToolSelected() {
      return this._toolSelection.asObservable();
   }

   public abortTheOthers(selected: string) {
      this._toolSelection.next(selected);
   }
}