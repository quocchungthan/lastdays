import { Injectable } from '@angular/core';
import Konva from 'konva';
import { filter, Observable, of, Subject } from 'rxjs';
import { Point } from '../../share-models/Point';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { SyncingService } from '../business/syncing-service';
import { KonvaObjectService } from '../services/konva-object.service';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { ToolSelectionService } from '../toolbar/tool-selection.service';
import { TextPastedEvent } from '../../syncing-models/TextPastedEvent';
import { BrowserService } from '../services/browser.service';
import {
  Init,
  Recover,
  ToRecoverableEvent,
} from './mappers/to-recoverable-event.mapper';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';
import { InstructionsService } from '../toolbar/instructions.service';

@Injectable()
export class RendererService implements IRendererService {
  private _activated = false;
  private _currentObject?: Konva.Group;
  private _drawingLayer!: Konva.Layer;
  private _textInputDialogVisible = false;
  private _currentTextPosition: Point | undefined;
  private _viewport!: Konva.Stage;
  private _assignedDialogPosition = new Subject<Point | undefined>();
  private _instruction = new Subject<ShortcutInstruction[]>();

  constructor(
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

  getInstructions(): Observable<ShortcutInstruction[]> {
    return this._instruction.asObservable().pipe(filter(() => this._activated));
  }

  get dialogPositionAssigned() {
    return this._assignedDialogPosition.asObservable();
  }

  submitText(userText: string) {
    if (userText) {
      const event: IEventGeneral = this._createTextPastedEvent(userText);
      // this._syncingService.storeEventAsync(event).then(() => {
      const konvaText = this._createKonvaText(event);
      this.addTransformer(konvaText);
      this.addKonvaTextToDrawingLayer(konvaText);
      // });
    }
    this._closeInputDialog();
  }

  private addTransformer(konvaText: Konva.Text) {
    konvaText.draggable(true);
    this._drawingLayer.add(
      new Konva.Transformer({
        nodes: [konvaText],
      })
    );
    this._instruction.next(this._instructionService.textSelectedInstrution);
  }

  private _closeInputDialog() {
    this._instruction.next(this._instructionService.textDefaultInstrution);
    this._textInputDialogVisible = false;
    this._assignedDialogPosition.next(undefined);
  }

  eliminateAllSelection() {
    const allSelection = this._drawingLayer.children.filter(
      (x) => x instanceof Konva.Transformer
    );
    this._drawingLayer.children
      .filter((x) => x instanceof Konva.Text && x.hasName('text_input_tool'))
      .forEach((x) => x.draggable(false));
    this._instruction.next(this._instructionService.textDefaultInstrution);
    allSelection.forEach((x) => {
      const event = ToRecoverableEvent(x.nodes()[0] as Konva.Text);
      this._syncingService.storeEventAsync(event).then(() => {
        x.destroy();
      });
    });
  }

  public activateTool(value: boolean) {
    this._activated = value;
    if (!this._activated) {
      this.eliminateAllSelection();
      this._closeInputDialog();
    } else {
      this._instruction.next(this._instructionService.textDefaultInstrution);
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

    const touchPos = { ...position };

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

  private _createTextPastedEvent(text: string): IEventGeneral {
    const event = new TextPastedEvent();
    event.position = this._currentTextPosition || { x: 0, y: 0 };
    event.text = text;
    event.color = this._toolSelection.onColorSelected; // Assume color is set via tool selection
    return event;
  }

  private _createKonvaText(eventRaw: IEventGeneral): Konva.Text {
    if (eventRaw.code !== 'TextPastedEvent') return new Konva.Text();
    const event = eventRaw as TextPastedEvent;
    const initiated = Init(
      event.text,
      event.position,
      this._toolSelection.onColorSelected
    );

    initiated.addName(event.eventId);

    return initiated;
  }

  // Recovery function for events to convert back to Konva objects
  public recover(event: IEventGeneral) {
    if (event.code !== 'TextPastedEvent') return Promise.resolve();
    const eventPasted = event as TextPastedEvent;
    const konvaText = Recover(eventPasted);
    this.addKonvaTextToDrawingLayer(konvaText);
    return Promise.resolve();
  }

  private allowToSelectByRightClick(konvaText: Konva.Text) {
    this._interactiveEventService
      .onRightClicked(konvaText)
      .pipe(filter(() => !this._textInputDialogVisible))
      .subscribe((point) => {
        this.focusingOnCurrentKonvaText(konvaText);
      });
  }

  private addKonvaTextToDrawingLayer(konvaText: Konva.Text) {
    // Prevent duplicated textes on Unselect
    this.allowToSelectByRightClick(konvaText);
    const pastedBefore = this._drawingLayer.children.filter(
      (pastedText) =>
        pastedText instanceof Konva.Text &&
        this.identicalInNames(konvaText, pastedText)
        && this.identicalInNames(pastedText, konvaText)
    );
    pastedBefore.forEach((p) => {
      p.destroy();
    });
    this._drawingLayer.add(konvaText);
    this._drawingLayer.draw();
  }

  private identicalInNames(t1: Konva.Text, t2: Konva.Text): unknown {
    return t1
      .name()
      .split(' ')
      .every((n) => t2.hasName(n));
  }

  private focusingOnCurrentKonvaText(konvaText: Konva.Text) {
    this.eliminateAllSelection();
    this._toolSelection.abortTheOthers('text-input');
    this.addTransformer(konvaText);
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
