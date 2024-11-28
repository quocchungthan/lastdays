import { Injectable } from "@angular/core";
import { InstructionsService } from "../toolbar/instructions.service";
import { Subject, Observable, filter } from "rxjs";
import { ShortcutInstruction } from "../_area-base/shortkeys-instruction.model";
import { IRendererService } from "../_area-base/renderer.service.interface";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";
import { CursorService } from "../toolbar/cursor.service";
import { KonvaObjectService } from "../services/konva-object.service";
import Konva from "konva";
import { ViewPortEventsManager } from "../services/ViewPortEvents.manager";
import { TextRendererService } from "../_area-text-input";
import { PencilRendererService } from "../_area-pencil";
import { ToRecoverableEvent } from "./mappers/to-coverable-event.mapper";
import { SyncingService } from "../business/syncing-service";
import { ObjectDeltionEvent } from "../../syncing-models/ObjectDeletionEvent";
import { MovingArrowRendererService } from "../_area-moving-arrow";

@Injectable()
export class RendererService implements IRendererService {
private _instruction = new Subject<ShortcutInstruction[]>();
  private _activated: boolean = false;
   private _drawingLayer!: Konva.Layer;
   private _viewport!: Konva.Stage;
   onDeleting: boolean = false;

  /**
   *
   */
  constructor(
      private _interactiveEventService: ViewPortEventsManager,
      konvaObjectService: KonvaObjectService,
      private instructionSErvice: InstructionsService,
      private cursors: CursorService,
      private inputRenderService: TextRendererService,
      private pencilRenderer: PencilRendererService,
      private syncingService: SyncingService,
      private arrowRenderer: MovingArrowRendererService) {
   konvaObjectService.viewPortChanges.subscribe((stage) => {
      this._drawingLayer = stage.children.find(
        (x) => x instanceof Konva.Layer && x.hasName('DrawingLayer')
      ) as Konva.Layer;
      this._viewport = stage;
    });
    this._listenToEvents();
  }
  private _listenToEvents() {
   this._interactiveEventService
     .onTouchStart()
     .pipe(filter(() => this._activated))
     .subscribe((position) => {
       this.onDeleting = true;
     });

     this._interactiveEventService
     .onTouchMove()
     .pipe(filter(() => this._activated))
     .subscribe((position) => {
      if (this.onDeleting) {
         // Convert touch position to the coordinate system of the layer
         const touchPos = {
           x: position.x,
           y: position.y,
         };
 
         // Get all the objects on the _konvaLayer
         const objectsUnderTouch = this._drawingLayer.getChildren();
 
         // Loop through objects to find any collision
         objectsUnderTouch.forEach((obj) => {
            const collision = this.inputRenderService.collision(obj, touchPos)
               || this.pencilRenderer.collision(obj, touchPos)
               || this.arrowRenderer.collision(obj, touchPos);
           if (collision) {
              this.handleObjectCollision(obj);
           }
         });
       }
     });

     this._interactiveEventService
     .onTouchEnd()
     .pipe(filter(() => this._activated))
     .subscribe((position) => {
       this.onDeleting = false;
     });
   }

   handleObjectCollision(obj: Konva.Group | Konva.Shape) {
      const event = ToRecoverableEvent(obj);
      this.syncingService.storeEventAsync(event)
         .then(() => {
            return this.recover(event);
         })
         .then(() => {});
   }

   recover(event: IEventGeneral): Promise<void> {
      if (!(event.code === 'ObjectDeltionEvent')) return Promise.resolve();
      const pasted = event as ObjectDeltionEvent;
      const target = this._drawingLayer.children.find(x => x.hasName(pasted.target));
      if (target) {
         target.destroy();
      }
      return Promise.resolve();
   }

  activateTool(active: boolean) {
    this._activated = active;
    if (this._activated) {
      this._instruction.next(this.instructionSErvice.eraserDefaultInstruction);
      this.cursors.eraser();
    }
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
   return this._instruction.asObservable().pipe(filter(() => this._activated));
 }
}
