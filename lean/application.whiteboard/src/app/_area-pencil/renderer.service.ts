import { Injectable } from '@angular/core';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { filter } from 'rxjs/internal/operators/filter';
import { Point } from '../../share-models/Point';
import Konva from 'konva';
import { KonvaObjectService } from '../services/konva-object.service';
import { ToolSelectionService } from '../toolbar/tool-selection.service';
import { Init, Recover, ToRecoverableEvent } from './mappers/to-recoverable-event.mapper';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { PencilUpEvent } from '../../syncing-models/PencilUpEvent';
import { SyncingService } from '../business/syncing-service';
import { IRendererService } from '../_area-base/renderer.service.interface';

@Injectable()
export class RendererService implements IRendererService {
  private _activated = false;
  private _currentObject?: Konva.Line;
  private _drawingLayer!: Konva.Layer;

  constructor(
    private _interactiveEventService: ViewPortEventsManager,
    private _toolSelection: ToolSelectionService,
    konvaObjectService: KonvaObjectService,
    private _syncingService: SyncingService  ) {
    konvaObjectService.viewPortChanges.subscribe((stage) => {
      this._drawingLayer = stage.children.find(
        (x) => x instanceof Konva.Layer && x.hasName('DrawingLayer')
      ) as Konva.Layer;
    });
    this._listenToEvents();
  }

  public activateTool(value: boolean) {
    this._activated = value;
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

  // Inteface common between the commands that matches the Events manager so that's make code much more simple, less switch case.
  public penDown(position: Point) {
    if (this._currentObject) {
      return;
    }

    this._currentObject = Init(position, this._toolSelection.onColorSelected);
    this._drawingLayer.add(this._currentObject);
  }

  public penMove(position: Point) {
    if (!this._currentObject) {
      return;
    }

    this._currentObject.points(
      this._currentObject.points().concat([position.x, position.y])
    );
  }

  public penUp() {
    const toBeSaved = this._currentObject;
    this._currentObject?.destroy();
    this._currentObject = undefined;

    return toBeSaved;
  }

  public recover(event: IEventGeneral) {
    if (event.code !== "PencilUpEvent") return Promise.resolve();
    if (this._drawingLayer.children.find(x => x.name() === (event as PencilUpEvent).name)) return Promise.resolve();

    this._drawingLayer.add(Recover(event as PencilUpEvent));

    return Promise.resolve();
  }

  private _pendEnd() {
    const tobeSaved = this.penUp();
    if (!tobeSaved || (tobeSaved.points().length ?? 0) < 5) return;
    const newEvent = ToRecoverableEvent(tobeSaved);
    this._syncingService.storeEventAsync(newEvent)
      .then(() => {
        this.recover(newEvent);
      });
  }
}
