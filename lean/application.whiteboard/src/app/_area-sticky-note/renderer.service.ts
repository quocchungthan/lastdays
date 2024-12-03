import { Injectable } from "@angular/core";
import { IRendererService } from "../_area-base/renderer.service.interface";
import Konva from "konva";
import { IRect } from "konva/lib/types";
import { Subject, Observable, filter, map } from "rxjs";
import { Point } from "../../share-models/Point";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";
import { ShortcutInstruction } from "../_area-base/shortkeys-instruction.model";
import { SyncingService } from "../business/syncing-service";
import { BrowserService } from "../services/browser.service";
import { KonvaObjectService } from "../services/konva-object.service";
import { ViewPortEventsManager } from "../services/ViewPortEvents.manager";
import { CursorService } from "../toolbar/cursor.service";
import { InstructionsService } from "../toolbar/instructions.service";
import { ToolSelectionService } from "../toolbar/tool-selection.service";
import { StickyNotePastedEvent } from "../../syncing-models/StickyNotePastedEvent";
import { Init, Recover } from "./mappers/to-coverable-event";

@Injectable()
export class RendererService implements IRendererService {
   private static threshold = 1;
   private _activated = false;
   private _currentObject?: Konva.Group;
   private _drawingLayer!: Konva.Layer;
   private _currentTextPosition: Point | undefined;
   private _viewport!: Konva.Stage;
   private _assignedDialogPosition = new Subject<Point | undefined>();
   private _instruction = new Subject<ShortcutInstruction[]>();
 
   constructor(
     private _curors: CursorService,
     private _interactiveEventService: ViewPortEventsManager,
     private _toolSelection: ToolSelectionService,
     konvaObjectService: KonvaObjectService,
     private _syncingService: SyncingService,
     private _browserService: BrowserService,
     private _instructionService: InstructionsService,
   ) {
     konvaObjectService.viewPortChanges.subscribe((stage) => {
       this._drawingLayer = stage.children.find(
         (x) => x instanceof Konva.Layer && x.hasName('DrawingLayer')
       ) as Konva.Layer;
       this._viewport = stage;
     });
     this._listenToEvents();
   }
   
   startEditExistingText() {
     const heldObject = this.getHeldObject();
     this._showTextInputDialog(heldObject.position());
   }
 
   getOriginalTextForEdit() {
     return this.getHeldObject()?.text() ?? null;
   }
   
   private getHeldObject() {
     const holdingTransformer = this._drawingLayer.children.filter(x => x instanceof Konva.Transformer) as Konva.Transformer[];
     const heldObject = holdingTransformer[0]?.nodes()?.[0] as Konva.Text;
     return heldObject;
   }
 
   collision(obj: Konva.Group | Konva.Shape, touchPos: Point): Konva.Group | Konva.Shape | null {
     if (!(obj instanceof Konva.Text)) return null;
     const rect = obj.getClientRect();
     touchPos.x *= this._viewport.scaleX();
     touchPos.y *= this._viewport.scaleY();
     if (obj.hasName('text_input_tool') && !this.isTouchPointOutsideOfClientrect(rect, touchPos)) {
       return obj;
     }
 
     return null;
   }
 
   
   closedToTouchPoint(p1: Point, p2: Point) {
     const distance = this.calculateDistance(p1, p2);
     return distance <= RendererService.threshold;
   }
 
   private calculateDistance(p1: Point, p2: Point): number {
     return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
   }
 
   getInstructions(): Observable<ShortcutInstruction[]> {
     return this._instruction.asObservable().pipe(filter(() => this._activated));
   }
 
   private _closeInputDialog() {
     this._instruction.next(this._instructionService.textDefaultInstrution);
     this._assignedDialogPosition.next(undefined);
   }
 
 
   public activateTool(value: boolean) {
     this._activated = value;
     if (!this._activated) {
       this._closeInputDialog();
     } else {
       this._instruction.next(this._instructionService.stickNoteDefaultInstrution);
       this._curors.stickyNote();
     }
   }
 
   private _listenToEvents() {
     this._interactiveEventService
       .onTouchStart()
       .pipe(filter(() => this._activated))
       .subscribe((position) => {
         const newStickyNote = Init({x: position.x - 75, y: position.y - 20}, this._toolSelection.selectedColor);
         this._drawingLayer.add(newStickyNote);
       });
 
     this._browserService.onEscape().subscribe(() => {
       this._closeInputDialog();
     });
   }
 
   private isTouchPointOutsideOfClientrect(bounds: IRect, touchPos: { x: number; y: number; }) {
     // Check if the touch position is outside the bounding box
     bounds.x -= this._viewport.x();
     bounds.y -= this._viewport.y();
     return (
       touchPos.x < bounds.x ||
       touchPos.x > bounds.x + bounds.width ||
       touchPos.y < bounds.y ||
       touchPos.y > bounds.y + bounds.height
     );
   }
 
   private _showTextInputDialog(position: Point) {
     const absolutePosition = this.calculateAbsolutePosition(position);
     this.assignPosition(absolutePosition);
     this._instruction.next(this._instructionService.textInputPopupShownInstruction);
   }
 
   assignPosition(absolutePosition: Point) {
     this._assignedDialogPosition.next(absolutePosition);
   }
 
   calculateAbsolutePosition(position: Point): Point {
     const absoluteX =
       (position.x / (this._viewport.x() / this._viewport.scaleX())) *
       (window.innerWidth / 2);
     const absoluteY =
       (position.y / (this._viewport.y() / this._viewport.scaleY())) *
       (window.innerHeight / 2);
 
     return { x: absoluteX, y: absoluteY };
   }

   // Recovery function for events to convert back to Konva objects
   public recover(event: IEventGeneral) {
    if (event.code !== 'StickyNotePastedEvent') return Promise.resolve();
  
    const parsedEvent = event as StickyNotePastedEvent;
    const konvaObject = Recover(parsedEvent);
    this._drawingLayer.add(konvaObject);
    return Promise.resolve();
   }
 
   openMenuContext(p: Point) {
     this._assignedDialogPosition.next(p);
   }
}
 