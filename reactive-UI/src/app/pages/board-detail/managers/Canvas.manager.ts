import Konva from 'konva';
import { PRIMARY_COLOR } from '../../../configs/theme.constants';
import { BackgroundLayerManager } from './BackgroundLayer.manager';
import { ViewPortEventsManager } from './ViewPortEvents.manager';
import { CursorManager } from './Cursor.manager';
import { UserDrawingLayerManager } from './UserDrawingLayer.manager';
import { StickyNoteCommands } from '../commands/sticky-notes.command';
import { PencilCommands } from '../commands/pencil.command';
import { BoardsService } from '../../../services/data-storages/boards.service';
import { UrlExtractorService } from '../../../services/browser/url-extractor.service';
import { Injectable } from '@angular/core';
import { KonvaObjectService } from '../../../services/3rds/konva-object.service';

@Injectable({
    providedIn: 'root'
})
export class CanvasManager {
    private _viewPort!: Konva.Stage;
    private _tool: string = '';

    constructor(
        _konvaObjects: KonvaObjectService, 
        private _viewPortEvents: ViewPortEventsManager,
        boards: BoardsService, 
        private _urlExtractor: UrlExtractorService,
        private _background: BackgroundLayerManager,
        private _cursorManager: CursorManager,
        private _userDrawing: UserDrawingLayerManager) {
        _konvaObjects.viewPortChanges.subscribe((s) => {
            this.initiateBasedOnBackgroundStage(s, boards, _urlExtractor);
        });
    }

    private initiateBasedOnBackgroundStage(stage: Konva.Stage, boards: BoardsService, _urlExtractor: UrlExtractorService) {
        this._viewPort = stage;
        this._viewPortEvents.onDragStart().subscribe(() => {
            this._cursorManager.grabbing();
        });

        this._viewPortEvents.onDragEnd().subscribe(() => {
            this._background.putTheRuler();
        });

        this._viewPortEvents.onTouchEnd().subscribe(() => {
            if (!this._tool) {
                this._cursorManager.reset();
            }
        });
    }

    public setTool(tool: string) {
        this._tool = tool;
        this._userDrawing.setTool(tool);
        // TODO: if Tool everywhere, need an interface, and put implementations 
        // that has the same condition in one class which is instance of that interface.
        if (!this._tool) {
            this._cursorManager.reset();
            this._viewPort.draggable(true);

            return;
        }

        this._viewPort.draggable(false);

        if (this._tool == StickyNoteCommands.CommandName) {
            this._cursorManager.reset();
        }

        if (this._tool == PencilCommands.CommandName) {
            this._cursorManager.pencil();
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
}