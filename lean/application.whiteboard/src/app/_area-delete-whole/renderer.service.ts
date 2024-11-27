import { Injectable } from "@angular/core";
import { InstructionsService } from "../toolbar/instructions.service";
import { Subject, Observable, filter } from "rxjs";
import { ShortcutInstruction } from "../_area-base/shortkeys-instruction.model";
import { IRendererService } from "../_area-base/renderer.service.interface";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";
import { CursorService } from "../toolbar/cursor.service";

@Injectable()
export class RendererService implements IRendererService {
private _instruction = new Subject<ShortcutInstruction[]>();
  private _activated: boolean = false;

  /**
   *
   */
  constructor(private instructionSErvice: InstructionsService, private cursors: CursorService) {
   
  }
   recover(event: IEventGeneral): Promise<void> {
      return Promise.resolve();
   }
  activateTool(active: boolean) {
    this._activated = active;
    if (this._activated) {
      this._instruction.next(this.instructionSErvice.eraserDefaultInstruction);
      this.cursors.eraser();
    } else {
      // TODO: handle in every tool.
      this.cursors.reset();
    }
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
   return this._instruction.asObservable().pipe(filter(() => this._activated));
 }
}
