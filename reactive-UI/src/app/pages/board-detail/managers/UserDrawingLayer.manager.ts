import Konva from "konva";
import { PRIMARY_COLOR } from "../../../configs/theme.constants";
import { PencilCommands } from "../commands/pencil.command";
import { BoardsService } from "../../../services/data-storages/boards.service";
import { UrlExtractorService } from "../../../services/browser/url-extractor.service";
import { ViewPortEventsManager } from "./ViewPortEvents.manager";
import { Injectable } from "@angular/core";
import { KonvaObjectService } from "../../../services/3rds/konva-object.service";

@Injectable({
    providedIn: 'root'
})
export class UserDrawingLayerManager {
    private _drawingLayer: Konva.Layer;
    // TODO: Theme and tool are duplicated where they're stored
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _tool: string = '';
    private _pencil!: PencilCommands;
    private _viewPort!: Konva.Stage;

    constructor(
        _konvaObjects: KonvaObjectService,
        private _events: ViewPortEventsManager, 
        private boards: BoardsService,
        private _urlExtractor: UrlExtractorService) {
        this._drawingLayer = new Konva.Layer();
        _konvaObjects.viewPortChanges.subscribe(s => {
            this._viewPort = s;
            this._viewPort.add(this._drawingLayer);
        });
        
        this._startSubscribingEvents();
    }
    
    private _startSubscribingEvents() {
        this._pencil = new PencilCommands(this._drawingLayer);
        this._events.onTouchStart()
            .subscribe((p) => {
                if (this._tool === PencilCommands.CommandName) {
                    this._pencil.penDown(p);
                }
            });
        this._events.onTouchMove()
            .subscribe((p) => {
                if (this._tool === PencilCommands.CommandName) {
                    this._pencil.penMove(p);
                }
            });

        this._events.onTouchEnd()
            .subscribe((p) => {
                this._handleDrawingEnd();
            });
        this._events.onMouseOut()
            .subscribe((p) => {
                this._handleDrawingEnd();
            });
    }

    private _handleDrawingEnd() {
        if (this._tool === PencilCommands.CommandName) {
            // TODO: Store to local database as an event in case the site is refrehsed
            // TODO: Flow
            // TODO: Command via chat
            var brandNewDrawing = this._pencil.penUp();
            this._urlExtractor.currentBoardIdChanges()
                .subscribe((id) => {
                    this.boards.detail(id)
                        .then(currentBoard => {
                            // currentBoard.
                        });
                });
        }
    }

    setTool(tool: string) {
        this._tool = tool;
    }
}
