import { Injectable } from '@angular/core';
import Konva from 'konva';
import { filter, Subject } from 'rxjs';
import { Point } from '../../share-models/Point';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { SyncingService } from '../business/syncing-service';
import { KonvaObjectService } from '../services/konva-object.service';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { ToolSelectionService } from '../toolbar/tool-selection.service';
import { TextPastedEvent } from '../../syncing-models/TextPastedEvent';
import { BrowserService } from '../services/browser.service';
import { Init, Recover } from './mappers/to-recoverable-event.mapper';

@Injectable()
export class RendererService implements IRendererService {
  private _activated = false;
  private _currentObject?: Konva.Group;
  private _drawingLayer!: Konva.Layer;
  private _textInputDialogVisible = false;
  private _currentTextPosition: Point | undefined;
  private _viewport!: Konva.Stage;
  private _assignedDialogPosition = new Subject<Point | undefined>();

  constructor(
    private _interactiveEventService: ViewPortEventsManager,
    private _toolSelection: ToolSelectionService,
    konvaObjectService: KonvaObjectService,
    private _syncingService: SyncingService,
    private _browserService: BrowserService
  ) {
    konvaObjectService.viewPortChanges.subscribe((stage) => {
      this._drawingLayer = stage.children.find(
        (x) => x instanceof Konva.Layer && x.hasName('DrawingLayer')
      ) as Konva.Layer;
      this._viewport = stage;
    });
    this._listenToEvents();
  }

  get dialogPositionAssigned() {
    return this._assignedDialogPosition.asObservable();
  }

  submitText(userText: string) {
    if (userText) {
      const event: IEventGeneral = this._createTextPastedEvent(userText);
      // this._syncingService.storeEventAsync(event).then(() => {
      const konvaText = this._createKonvaText(event);
      this._drawingLayer.add(konvaText);
      this._drawingLayer.add(
        new Konva.Transformer({
          nodes: [konvaText],
        })
      );
      this._drawingLayer.draw();
      // });
    }
    this._closeInputDialog();
  }

  private _closeInputDialog() {
    this._textInputDialogVisible = false;
    this._assignedDialogPosition.next(undefined);
  }

  eliminateAllSelection() {
    const allSelection = this._drawingLayer.children.filter(
      (x) => x instanceof Konva.Transformer
    );
    this._drawingLayer.children.filter(
      (x) => x instanceof Konva.Text && x.hasName('text_input_tool')
    )
      .forEach(x => x.draggable(false));
  
    allSelection.forEach((x) => x.destroy());
  }

  public activateTool(value: boolean) {
    this._activated = value;
    if (!this._activated) {
      this._assignedDialogPosition.next(undefined);
    }
  }

  private _listenToEvents() {
    this._interactiveEventService
      .onTouchStart()
      .pipe(filter(() => this._activated))
      .subscribe((position) => {
        const isOutsideTransformer =
          this.reasoningIsTheTouchOutsideOfAll(position);

        if (isOutsideTransformer === true) {
          // Call eliminateAllSelection if the touch is outside any transformer
          this.eliminateAllSelection();
        } else if (isOutsideTransformer === null) {
          // If inside a transformer, handle text input dialog logic
          if (!this._textInputDialogVisible) {
            this._currentTextPosition = position;
            this._textInputDialogVisible = true;
            this._showTextInputDialog(position);
          }
        }
      });

    this._browserService.onEscape().subscribe(() => {
      this._closeInputDialog();
      this.eliminateAllSelection();
    });
  }

  private reasoningIsTheTouchOutsideOfAll(position: Point) {
    // Check if there are no transformers in the layer
    const transformers = this._drawingLayer.children.filter(
      (child) => child instanceof Konva.Transformer
    );
    if (transformers.length === 0) {
      // If no transformers, return false (no need to check further)
      return null;
    }

    const touchPos = {...position};
    
    touchPos.x *= this._viewport.scaleX();
    touchPos.y *= this._viewport.scaleY();
    // Check if the touch is outside all transformers
    const isOutsideTransformer = this._drawingLayer.children
      .filter((child) => child instanceof Konva.Transformer)
      .every((transformer) => {
        // Get the bounding box of the transformer
        const transformerBounds = transformer.getClientRect();
        // Check if the touch position is outside the bounding box
        transformerBounds.x -= this._viewport.x();
        transformerBounds.y -= this._viewport.y();
        return (
          touchPos.x < transformerBounds.x ||
          touchPos.x > transformerBounds.x + transformerBounds.width ||
          touchPos.y < transformerBounds.y ||
          touchPos.y > transformerBounds.y + transformerBounds.height
        );
      });
    return isOutsideTransformer;
  }

  private _showTextInputDialog(position: Point) {
    // Show dialog at the touch position (position.x, position.y)
    // Once the user submits the text, this would trigger the text submission logic
    const absolutePosition = this.calculateAbsolutePosition(position);
    this.assignPosition(absolutePosition);
    // const userText = prompt('Enter your text:'); // Using prompt for simplicity

    // if (userText) {
    //   const event: IEventGeneral = this._createTextPastedEvent(userText);
    //   this._syncingService.storeEventAsync(event).then(() => {
    //     const konvaText = this._createKonvaText(event);
    //     this._drawingLayer.add(konvaText);
    //     this._drawingLayer.add(new Konva.Transformer({
    //      nodes: [konvaText]
    //     }))
    //     this._drawingLayer.draw();
    //   });
    // }
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

  private _createTextPastedEvent(text: string): IEventGeneral {
    const event = new TextPastedEvent();
    event.position = this._currentTextPosition || { x: 0, y: 0 };
    event.name = text;
    event.color = this._toolSelection.onColorSelected; // Assume color is set via tool selection
    return event;
  }

  private _createKonvaText(eventRaw: IEventGeneral): Konva.Text {
    if (eventRaw.code !== 'TextPastedEvent') return new Konva.Text();
    const event = eventRaw as TextPastedEvent;
    return Init(
      event.name,
      event.position,
      this._toolSelection.onColorSelected
    );
  }

  // Recovery function for events to convert back to Konva objects
  public recover(event: IEventGeneral) {
    if (event.code !== 'TextPastedEvent') return Promise.resolve();
    const eventPasted = event as TextPastedEvent;
    const konvaText = Recover(eventPasted);
    this._drawingLayer.add(konvaText);
    this._drawingLayer.draw();
    return Promise.resolve();
  }

  public penDown(position: Point) {
    if (this._currentObject) {
      return;
    }
    // Pen down logic if needed
  }

  public penMove(position: Point) {
    if (!this._currentObject) {
      return;
    }
    // No need to implement since we are typing instead of dragging or moving
  }

  public penUp() {
    // No need to implement since we are typing instead of dragging or moving
  }

  private _pendEnd() {
    // No need to implement since we are typing instead of dragging or moving
  }
}
