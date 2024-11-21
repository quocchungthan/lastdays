import { Injectable } from '@angular/core';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { filter } from 'rxjs/internal/operators/filter';
import { Point } from '../../share-models/Point';
import Konva from 'konva';
import { KonvaObjectService } from '../services/konva-object.service';
import { STROKE_WIDTH } from '../../shared-configuration/size';
import { ToolSelectionService } from '../toolbar/tool-selection.service';

@Injectable()
export class RendererService {
  private _activated = false;
  private _currentObject?: Konva.Line;
  private _drawingLayer!: Konva.Layer;
  private _size = STROKE_WIDTH;

  constructor(
    private _interactiveEventService: ViewPortEventsManager,
    private _toolSelection: ToolSelectionService,
    konvaObjectService: KonvaObjectService
  ) {
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
        const tobeSaved = this.penUp();
        this._pendEnd();
      });
  }

  // Inteface common between the commands that matches the Events manager so that's make code much more simple, less switch case.
  public penDown(position: Point) {
    if (this._currentObject) {
      return;
    }

    this._currentObject = new Konva.Line({
      fill: 'transparent',
      stroke: this._toolSelection.onColorSelected,
      strokeWidth: this._size,
      points: [position.x, position.y, position.x, position.y],
    });
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
  private _pendEnd() {
    const tobeSaved = this.penUp();
    console.log(tobeSaved);
  }
}
