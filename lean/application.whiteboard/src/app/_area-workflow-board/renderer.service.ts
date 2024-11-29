import { Injectable } from '@angular/core';
import Konva from 'konva';
import { SyncingService } from '../business/syncing-service';
import { KonvaObjectService } from '../services/konva-object.service';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { CursorService } from '../toolbar/cursor.service';
import { InstructionsService } from '../toolbar/instructions.service';
import { ToolSelectionService } from '../toolbar/tool-selection.service';
import { filter, Observable, Subject } from 'rxjs';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';

@Injectable()
export class RendererService implements IRendererService {
   _activated = false;
   private _viewport!: Konva.Stage;
   private _drawingLayer!: Konva.Layer;
   private _instruction = new Subject<ShortcutInstruction[]>();

  constructor(
   private _interactiveEventService: ViewPortEventsManager,
   private _toolSelection: ToolSelectionService,
   konvaObjectService: KonvaObjectService,
   private _syncingService: SyncingService,
   private _instructionsService: InstructionsService,
   private _cursors: CursorService) {
   konvaObjectService.viewPortChanges.subscribe((stage) => {
     this._viewport = stage;
     this._drawingLayer = stage.children.find(
       (x) => x instanceof Konva.Layer && x.hasName('DrawingLayer')
     ) as Konva.Layer;
   });
   this._listenToEvents();
 }
   recover(event: IEventGeneral): Promise<void> {
      return Promise.resolve();
   }
  activateTool(active: boolean) {
    this._activated = active;
    if (this._activated) {
      this._cursors.areaSelection();
      this._instruction.next(this._instructionsService.workflowBoardDefaultInstruction);
    }
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
   return this._instruction.asObservable().pipe(filter(() => this._activated));
 }
  
  private _listenToEvents() {
   this._interactiveEventService
     .onTouchStart()
     .pipe(filter(() => this._activated))
     .subscribe((p) => {
      //  this.penDown(p);
     });
   this._interactiveEventService
     .onTouchMove()
     .pipe(filter(() => this._activated))
     .subscribe((p) => {
      //  this.penMove(p);
     });

   this._interactiveEventService
     .onTouchEnd()
     .pipe(filter(() => this._activated))
     .subscribe((p) => {
      //  this._pendEnd();
     });
   this._interactiveEventService
     .onMouseOut()
     .pipe(filter(() => this._activated))
     .subscribe((p) => {
      //  this._pendEnd();
     });
 }
}
