import Konva from "konva";
import { PRIMARY_COLOR } from "../../../configs/theme.constants";
import { PencilCommands } from "../commands/pencil.command";
import { BoardsService } from "../../../services/data-storages/boards.service";
import { UrlExtractorService } from "../../../services/browser/url-extractor.service";
import { ViewPortEventsManager } from "./ViewPortEvents.manager";
import { Injectable, OnDestroy } from "@angular/core";
import { KonvaObjectService } from "../../../services/3rds/konva-object.service";
import { DrawingObjectService } from "../../../services/data-storages/drawing-object.service";
import { DrawingObject } from "../../../services/data-storages/entities/DrawingObject";

@Injectable()
export class UserDrawingLayerManager implements OnDestroy {
    private _drawingLayer: Konva.Layer;
    // TODO: Theme and tool are duplicated where they're stored
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _tool: string = '';
    private _pencil!: PencilCommands;
    private _viewPort!: Konva.Stage;
    private _boardId: string = '';

    constructor(
        _konvaObjects: KonvaObjectService,
        private _events: ViewPortEventsManager, 
        private boards: BoardsService,
        private _urlExtractor: UrlExtractorService,
        private _drawingObjects: DrawingObjectService) {
        this._drawingLayer = new Konva.Layer();
        this._pencil = new PencilCommands(this._drawingLayer);
        _konvaObjects.viewPortChanges.subscribe(s => {
            this._viewPort = s;
            this._viewPort.add(this._drawingLayer);
        });
        
        this._startSubscribingEvents();
        this._urlExtractor.currentBoardIdChanges()
            .subscribe((id) => {
                this._boardId = id;
                this._loadExistingDrawings();
            });
    }

    ngOnDestroy() {
        this._drawingLayer.removeChildren();
    }

    private _loadExistingDrawings() {
        if (!this._boardId) {
            return;
        }

        this._drawingObjects.index()
            .then((all) => {
                all.filter(x => x.boardId === this._boardId).map(x => x.konvaObject)
                    .forEach(x => {
                        if (!x) {
                            return;
                        }

                        if (typeof x === 'string') {
                            const parsed = JSON.parse(x) as Konva.Shape;
                            this._recoverDrawingsOnLayer(parsed);
                        } else {
                            this._recoverDrawingsOnLayer(x);
                        }
                    });
            });
    }
    
    private _recoverDrawingsOnLayer(x: Konva.Shape) {
        if (x?.className === 'Line') {
            this._pencil.parseFromJson(x);
        }
    }

    private _startSubscribingEvents() {
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
            // TODO: Flow
            // TODO: Command via chat
            var brandNewDrawing = this._pencil.penUp();
            const newDrawingObject = new DrawingObject();
            newDrawingObject.boardId = this._boardId;
            newDrawingObject.konvaObject = brandNewDrawing;
            this._drawingObjects.create(newDrawingObject)
                .then((x) =>{
                    console.log('Saved', x);
                });
        }
    }

    setTool(tool: string) {
        this._tool = tool;
    }
}
