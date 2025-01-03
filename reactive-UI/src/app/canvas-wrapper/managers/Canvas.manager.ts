import Konva from 'konva';
import { BackgroundLayerManager } from './BackgroundLayer.manager';
import { ViewPortEventsManager } from './ViewPortEvents.manager';
import { CursorManager } from './Cursor.manager';
import { UserDrawingLayerManager } from './UserDrawingLayer.manager';
import { StickyNoteCommands } from '../commands/sticky-notes.command';
import { PencilCommands } from '../commands/pencil.command';
import { Injectable, OnDestroy } from '@angular/core';
import { TextInputCommands } from '../commands/text-input.command';
import { Wheel } from '../../../ui-utilities/types/Wheel';
import { KonvaObjectService } from '../services/3rds/konva-object.service';
import { UrlExtractorService } from '../../services/browser/url-extractor.service';
import { BoardsService } from '../../services/data-storages/boards.service';
import { Subject, takeUntil } from 'rxjs';
import { GeneralUndoEvent } from '@drawings/EventQueue';

@Injectable()
export class CanvasManager implements OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private _viewPort!: Konva.Stage;

    constructor(
        _konvaObjects: KonvaObjectService, 
        private _viewPortEvents: ViewPortEventsManager,
        boards: BoardsService, 
        private _urlExtractor: UrlExtractorService,
        private _background: BackgroundLayerManager,
        private _cursorManager: CursorManager,
        private _userDrawing: UserDrawingLayerManager) {
        _konvaObjects.viewPortChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((s) => {
            this.initiateBasedOnBackgroundStage(s, boards, _urlExtractor);
        });

        _userDrawing.onDrawingToolEnd()
            .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
                this.setTool('');
            })
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    triggerUndoEvent(boardId: string) {
        const event = new GeneralUndoEvent();
        event.boardId = boardId;
        this._userDrawing.generallyProcessNewEvent(event);
    }

    public get tool () {
        return this._userDrawing.tool;
    }

    private initiateBasedOnBackgroundStage(stage: Konva.Stage, boards: BoardsService, _urlExtractor: UrlExtractorService) {
        this._viewPort = stage;
        this._viewPortEvents.onDragStart().pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this._cursorManager.grabbing();
        });

        this._viewPortEvents.onDragEnd().pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this._background.putTheRuler();
        });

        this._viewPortEvents.onTouchEnd().pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            if (!this.tool) {
                this._cursorManager.reset();
            }
        });

        this._viewPortEvents.onWheel().pipe(takeUntil(this.unsubscribe$)).subscribe((wheelEventData) => {
            this._background.putTheRuler();
            this._onRequestZooming(wheelEventData);
        });
    }

    public setTool(tool: string) {
        this._userDrawing.setTool(tool);
        // TODO: if Tool everywhere, need an interface, and put implementations 
        // that has the same condition in one class which is instance of that interface.
        if (!this.tool) {
            this._cursorManager.reset();
            this._viewPort.draggable(true);

            return;
        }

        this._viewPort.draggable(false);

        // TODO: move logic to the owner class
        if (this.tool == StickyNoteCommands.CommandName) {
            this._cursorManager.reset();
        }

        // TODO: move logic to the owner class
        if (this.tool == PencilCommands.CommandName) {
            this._cursorManager.pencil();
        }
        if (this.tool == TextInputCommands.CommandName) {
            this._cursorManager.textInput();
        }
    }

    public originateTopLeftCorner () {
        this._viewPort.position({
            x: this._viewPort.width() / 2,
            y: this._viewPort.height() / 2,
        });
    }

    drawBackground() {
      this.originateTopLeftCorner();
      this._background.putTheRuler();
    }
    
    private _onRequestZooming(wheelData: Wheel) {
        const scaleBy = 1.01;
        const oldScale = this._viewPort.scaleX();
        const pointer = this._viewPort.getPointerPosition();

        if (pointer === null) {
        //   console.log('Pointer can\'t be null');
          return;
        }

        const mousePointTo = {
          x: (pointer.x - this._viewPort.x()) / oldScale,
          y: (pointer.y - this._viewPort.y()) / oldScale,
        };

        const zoomInPercentage = wheelData.direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        this._viewPort.scale({ x: zoomInPercentage, y: zoomInPercentage });
        const newPos = {
          x: pointer.x - mousePointTo.x * zoomInPercentage,
          y: pointer.y - mousePointTo.y * zoomInPercentage,
        };
        this._viewPort.position(newPos);
    }
}