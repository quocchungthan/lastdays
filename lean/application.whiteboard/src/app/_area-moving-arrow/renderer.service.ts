import { Injectable } from "@angular/core";
import { CursorService } from "../toolbar/cursor.service";
import { InstructionsService } from "../toolbar/instructions.service";
import { filter, Observable, Subject } from "rxjs";
import { ShortcutInstruction } from "../_area-base/shortkeys-instruction.model";
import { IRendererService } from "../_area-base/renderer.service.interface";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";

@Injectable()
export class RendererService implements IRendererService {
   private _activated: boolean = false;
   private _instruction = new Subject<ShortcutInstruction[]>();

   constructor(private _cursors: CursorService, private _instructions: InstructionsService) {
      
   }
   recover(event: IEventGeneral): Promise<void> {
     return Promise.resolve();
   }
  activateTool(active: boolean) {
    this._activated = active;
    if (this._activated) {
      this._cursors.arrow();
      this._instruction.next(this._instructions.arrowDefaultInstruction);
    }
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
   return this._instruction.asObservable().pipe(filter(() => this._activated));
 }
}