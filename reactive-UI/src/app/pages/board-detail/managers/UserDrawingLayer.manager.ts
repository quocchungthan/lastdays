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
import { StickyNoteCommands } from "../commands/sticky-notes.command";
import { CursorManager } from "./Cursor.manager";
import { isNil } from "lodash";
import { Subject } from "rxjs";

@Injectable()
export class UserDrawingLayerManager implements OnDestroy {
    private _drawingLayer: Konva.Layer;
    // TODO: Theme and tool are duplicated where they're stored
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _tool: string = '';
    private _pencil!: PencilCommands;
    private _stickyNote: StickyNoteCommands;
    private _viewPort!: Konva.Stage;
    private _boardId: string = '';
    private _placeholderLayer: Konva.Layer;
    private _drawingToolEnd = new Subject<void>();

    constructor(
        _konvaObjects: KonvaObjectService,
        private _events: ViewPortEventsManager, 
        private boards: BoardsService,
        private _cursor: CursorManager,
        private _urlExtractor: UrlExtractorService,
        private _drawingObjects: DrawingObjectService) {
        this._drawingLayer = new Konva.Layer();
        this._placeholderLayer = new Konva.Layer();
        this._pencil = new PencilCommands(this._drawingLayer);
        this._stickyNote = new StickyNoteCommands(this._placeholderLayer, this._drawingLayer);
        _konvaObjects.viewPortChanges.subscribe(s => {
            if (s.children.some(x => x === this._drawingLayer)) {
                return;
            }
            this._viewPort = s;
            this._viewPort.add(this._drawingLayer);
            this._viewPort.add(this._placeholderLayer);
        });
        
        this._startSubscribingEvents();
        this._urlExtractor.currentBoardIdChanges()
            .subscribe((id) => {
                this._boardId = id;
                this._loadExistingDrawings();
            });
    }

    get tool() {
        return this._tool;
    }

    onDrawingToolEnd() {
        return this._drawingToolEnd.asObservable();
    }

    ngOnDestroy() {
        this._drawingLayer.removeChildren();
    }

    private _loadExistingDrawings() {
        if (!this._boardId) {
            return;
        }

        this._drawingObjects.index()
            .then(async (all) => {
                for (let o of all.filter(x => x.boardId === this._boardId).map(x => x.konvaObject)) {
                    if (!o) {
                        continue;
                    }

                    if (typeof o === 'string') {
                        const parsed = JSON.parse(o) as Konva.Shape;
                        await this._recoverDrawingsOnLayer(parsed);
                    } else {
                        await this._recoverDrawingsOnLayer(o);
                    }
                }
            });
    }
    
    private async _recoverDrawingsOnLayer(x: Konva.Shape) {
        if (x?.className === 'Line') {
            this._pencil.parseFromJson(x);
        }

        if (x?.className === 'Image') {
            await this._stickyNote.parseFromJson(x);
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
            const brandNewDrawing = this._pencil.penUp();
            this._syncToDb(brandNewDrawing);
        }

        if (this._tool === StickyNoteCommands.CommandName) {
            const brandNewDrawing = this._stickyNote.putnew();
            brandNewDrawing?.setAttr(StickyNoteCommands.UrlAttrName, brandNewDrawing.attrs.image.currentSrc);
            this._drawingToolEnd.next();
            this._syncToDb(brandNewDrawing);
        }
    }

    private _syncToDb(brandNewDrawing?: Konva.Shape) {
        if (isNil(brandNewDrawing)) {
            return;
        }
        const newDrawingObject = new DrawingObject();
        newDrawingObject.boardId = this._boardId;
        newDrawingObject.konvaObject = brandNewDrawing;
        this._drawingObjects.create(newDrawingObject)
            .then((x) => {
                console.log('Saved', x);
            });
    }

    setTool(tool: string) {
        this._tool = tool;
        this._setupSpecialCursor();
    }

    private _setupSpecialCursor() {
        if (this._tool !== StickyNoteCommands.CommandName) {
            this._stickyNote.detachPlaceholder();
            return;
        }

        this._stickyNote.attachStickyNotePlaceholder()
            .then((placeholder) => {
                this._cursor.grabbing();
                this._events.onCursorMove()
                    .subscribe((p) => {
                        if (!placeholder.visible()) {
                            return;
                        }

                        placeholder.position({x: p.x - placeholder.width() / 2, y: p.y - placeholder.height() / 2});
                    })
            })
    }
}
