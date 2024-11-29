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
import { AssistantService } from '../business/assistant.service';

@Injectable()
export class RendererService implements IRendererService {
  _activated = false;
  private _viewport!: Konva.Stage;
  private _drawingLayer!: Konva.Layer;
  private _instruction = new Subject<ShortcutInstruction[]>();

  // Variables for selection area
  private _selectionRect?: Konva.Rect;
  private _startPosition?: { x: number, y: number };

  constructor(
    private _interactiveEventService: ViewPortEventsManager,
    private _toolSelection: ToolSelectionService,
    konvaObjectService: KonvaObjectService,
    private _syncingService: SyncingService,
    private _instructionsService: InstructionsService,
    private _assistantService: AssistantService,
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
      .subscribe((point) => this._onTouchStart(point));

    this._interactiveEventService
      .onTouchMove()
      .pipe(filter(() => this._activated))
      .subscribe((point) => this._onTouchMove(point));

    this._interactiveEventService
      .onTouchEnd()
      .pipe(filter(() => this._activated))
      .subscribe(() => this._onTouchEnd());

    this._interactiveEventService
      .onMouseOut()
      .pipe(filter(() => this._activated))
      .subscribe(() => this._onTouchEnd());
  }

  // Handles the start of the selection
  private _onTouchStart(point: { x: number, y: number }) {
    this._startPosition = { x: point.x, y: point.y };

    // Get selected color from the toolSelection service
    const selectedColor = this._toolSelection.selectedColor;
    const { r, g, b } = this.hexToRgb(selectedColor);
    
    // Create a new rectangle for the selection with dynamic colors
    this._selectionRect = new Konva.Rect({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      dash: [8, 10],
      fill:  `rgba(${r}, ${g}, ${b}, 0.1)`,  // Adjusted fill color with alpha 0.3
      stroke: `rgba(${r}, ${g}, ${b}, 0.4)`,  // Use the selected color for stroke
      strokeWidth: 2,
    });

    // Add rectangle to drawing layer
    this._drawingLayer.add(this._selectionRect);
    this._drawingLayer.batchDraw();
  }

  // Updates the selection rectangle as the mouse moves
  private _onTouchMove(point: { x: number, y: number }) {
    if (!this._startPosition || !this._selectionRect) return;

    let width = point.x - this._startPosition.x;
    let height = point.y - this._startPosition.y;

    // Check if the width or height is negative, which means the selection went to the top-left
    if (width < 0) {
      this._selectionRect.x(point.x);  // Move the starting X position to the mouse X
      width = Math.abs(width);  // Use absolute value for width
    }

    if (height < 0) {
      this._selectionRect.y(point.y);  // Move the starting Y position to the mouse Y
      height = Math.abs(height);  // Use absolute value for height
    }

    // Update the rectangle's size and position
    this._selectionRect.width(width);
    this._selectionRect.height(height);

    // Redraw the layer
    this._drawingLayer.batchDraw();
  }

  // Ends the selection when mouse is released
  private _onTouchEnd() {
    if (this._selectionRect) {
      // Optionally, finalize the selection area (log, clear, or trigger an action)
      console.log('Selection area:', this._selectionRect.getClientRect());
         // Reset state
         this._startPosition = undefined;
      this._assistantService.requireUserPrompt()
         .then((userPrompt) => {
            // This is optional since the responding from AI might be slow
            const rect = this._selectionRect!.getClientRect();
            this.destroyTheSelectionArea();

            console.log('the prompt', userPrompt);
            if (userPrompt) {
               return this._assistantService.askForSuggestion(userPrompt, rect)
            } else {
               return Promise.resolve<IEventGeneral[]>([]);
            }
         })
         .then((receivedEvents) => {
            console.log('received ', receivedEvents);
         })
         .finally(() => {
            // Optionally clear the selection area after use
            this.destroyTheSelectionArea();
         });
    }
  }

   private destroyTheSelectionArea() {
      this._selectionRect?.destroy();
      this._drawingLayer.batchDraw();
      this._selectionRect = undefined;
   }

  // Helper function to convert hex color to RGB
  private hexToRgb(hex: string) {
    let r: number = 0, g: number = 0, b: number = 0;
    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return { r, g, b };
  }
}
