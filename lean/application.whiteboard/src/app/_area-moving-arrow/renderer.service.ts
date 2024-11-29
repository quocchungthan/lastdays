import { Injectable } from '@angular/core';
import { CursorService } from '../toolbar/cursor.service';
import { InstructionsService } from '../toolbar/instructions.service';
import { filter, Observable, Subject } from 'rxjs';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import Konva from 'konva';
import { Point } from '../../share-models/Point';
import { calculateDistance, pointsToCoordinations } from '../../utils/array.helper';
import { SyncingService } from '../business/syncing-service';
import { KonvaObjectService } from '../services/konva-object.service';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { ToolSelectionService } from '../toolbar/tool-selection.service';
import { ArrowPastedEvent } from '../../syncing-models/ArrowPastedEvent';
import { Init, Recover, ToRecoverableEvent } from './mappers/to-coverable-event';

@Injectable()
export class RendererService implements IRendererService {
  private _activated: boolean = false;
  private _instruction = new Subject<ShortcutInstruction[]>();
  private static threshold = 0.5;
  private _currentObject?: Konva.Arrow; // Changed from Konva.Line to Konva.Arrow
  private _drawingLayer!: Konva.Layer;
  private _viewport!: Konva.Stage;

  constructor(
    private _interactiveEventService: ViewPortEventsManager,
    private _toolSelection: ToolSelectionService,
    konvaObjectService: KonvaObjectService,
    private _syncingService: SyncingService,
    private _instructions: InstructionsService,
    private _cursors: CursorService
  ) {
    konvaObjectService.viewPortChanges.subscribe((stage) => {
      this._viewport = stage;
      this._drawingLayer = stage.children.find(
        (x) => x instanceof Konva.Layer && x.hasName('DrawingLayer')
      ) as Konva.Layer;
    });
    this._listenToEvents();
  }

  activateTool(active: boolean) {
    this._activated = active;
    if (this._activated) {
      this._cursors.arrow();
      this._instruction.next(this._instructions.arrowDefaultInstruction);
    }
  }

  private _listenToEvents() {
    this._interactiveEventService
      .onTouchStart()
      .pipe(filter(() => this._activated))
      .subscribe((p) => {
        this.penDown(p);
      });
    this._interactiveEventService
      .onTouchMove()
      .pipe(filter(() => this._activated))
      .subscribe((p) => {
        this.penMove(p);
      });

    this._interactiveEventService
      .onTouchEnd()
      .pipe(filter(() => this._activated))
      .subscribe((p) => {
        this._pendEnd();
      });
    this._interactiveEventService
      .onMouseOut()
      .pipe(filter(() => this._activated))
      .subscribe((p) => {
        this._pendEnd();
      });
  }

  collision(
    obj: Konva.Group | Konva.Shape,
    touchPos: Point
  ): Konva.Group | Konva.Shape | null {
    if (!(obj instanceof Konva.Arrow)) return null; // Changed to check for Arrow instead of Line
    const points = obj.points();
    touchPos.x /= this._viewport.scaleX();
    touchPos.y /= this._viewport.scaleY();
    console.log(touchPos,pointsToCoordinations(points))
    if (
      obj.hasName('moving-arrow') &&
      this.lineCutTheTouchPos(pointsToCoordinations(points), touchPos)
    ) {
      return obj;
    }

    return null;
  }

  lineCutTheTouchPos(startAndEnd: Point[], p2: Point) {
   const [p1, p3] = startAndEnd;
    return calculateDistance(p1, p2) + calculateDistance(p3, p2) - calculateDistance(p1, p3) <= RendererService.threshold / this._viewport.scaleX();
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
    return this._instruction.asObservable().pipe(filter(() => this._activated));
  }

  public penDown(position: Point) {
    if (this._currentObject) {
      return;
    }

    // Initialize a new Konva.Arrow object instead of Konva.Line
    this._currentObject = Init(position, this._toolSelection.selectedColor);

    this._drawingLayer.add(this._currentObject);
  }

  public penMove(position: Point) {
    if (!this._currentObject) {
      return;
    }

    // Update the arrow's endpoint as we move the mouse
    this._currentObject.points([this._currentObject.points()[0], this._currentObject.points()[1], position.x, position.y]);
  }

  public penUp() {
    if (!this._currentObject) {
      return undefined;
    }

    const toBeSaved = this._currentObject;
    // Create a ArrowPastedEvent and store it
    const event = ToRecoverableEvent(toBeSaved);

    // Destroy the object after usage
    this._currentObject?.destroy();
    this._currentObject = undefined;

    return event;  // Return the new event instead of the object
  }

  public recover(event: IEventGeneral) {
    if (event.code !== 'ArrowPastedEvent') return Promise.resolve();
    const pastedEvent = event as ArrowPastedEvent;
    if (
      this._drawingLayer.children.find(
        (x) => x.name() === pastedEvent.name
      )
    )
      return Promise.resolve();

    // Create a new arrow based on the event data and add it to the layer
    const arrow = Recover(pastedEvent);

    this._drawingLayer.add(arrow);
    return Promise.resolve();
  }

  private _pendEnd() {
    const tobeSaved = this.penUp();
    if (!tobeSaved || calculateDistance(tobeSaved.start, tobeSaved.end) < RendererService.threshold) return;

    // Store the event asynchronously and recover it
    this._syncingService.storeEventAsync(tobeSaved).then(() => {
      this.recover(tobeSaved);
    });
  }
}
