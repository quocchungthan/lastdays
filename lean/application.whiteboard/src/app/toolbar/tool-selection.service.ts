import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SUPPORTED_COLORS } from "../../shared-configuration/theme.constants";

@Injectable({
   providedIn: 'root'
})
export class ToolSelectionService {
   private _toolSelection = new BehaviorSubject<string>('default');
   private _colorSelection = new BehaviorSubject<string>(SUPPORTED_COLORS[0]);

   get onToolSelected() {
      return this._toolSelection.asObservable();
   }

   public abortTheOthers(selected: string) {
      this._toolSelection.next(selected);
   }

   get onColorSelected() {
      return this._colorSelection.getValue();
   }

   public selectColor(selected: string) {
      this._colorSelection.next(selected);
   }
}