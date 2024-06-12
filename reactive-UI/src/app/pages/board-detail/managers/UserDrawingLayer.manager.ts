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
import { Subject, debounceTime } from "rxjs";
import { Group } from "konva/lib/Group";
import guid from "guid";
import { ToolCompositionService } from "../../../services/states/tool-composition.service";

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
        private _drawingObjects: DrawingObjectService,
        private _toolComposition: ToolCompositionService) {
        this._drawingLayer = new Konva.Layer();
        this._placeholderLayer = new Konva.Layer();
        this._pencil = new PencilCommands(this._drawingLayer, _toolComposition);
        this._stickyNote = new StickyNoteCommands(this._placeholderLayer, this._drawingLayer, _toolComposition);
        this._stickyNote.onStickyNoteMoved()
            .subscribe(id => {
                this._updateStickyNoteById(id, this._stickyNote.getStickyNoteById(id));
            });
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
            .pipe(debounceTime(50))
            .subscribe((id) => {
                if (this._boardId !== id) {
                    this._boardId = id;
                    this._loadExistingDrawings();
                }
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
                        const parsed = JSON.parse(o) as Konva.Shape | Konva.Group;
                        await this._recoverDrawingsOnLayer(parsed);
                    } else {
                        await this._recoverDrawingsOnLayer(o);
                    }
                }
            });
    }
    
    private async _recoverDrawingsOnLayer(x: Konva.Shape | Konva.Group) {
        let insertedPencil = this._pencil.parseFromJson(x as Konva.Shape);
        if (x?.className === 'Group' && (x.attrs.name + "").split(" ").includes(StickyNoteCommands.StickyNoteName)) {
            await this._stickyNote.parseFromJson(x as Konva.Group);
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
                this._pencilEnd();
                this._stickyNoteEnd();
            });
        this._events.onMouseOut()
            .subscribe((p) => {
                this._pencilEnd();
            });
    }

    private _stickyNoteEnd() {
        if (this._tool === StickyNoteCommands.CommandName) {
            const brandNewDrawing = this._stickyNote.putnew();
            this._drawingToolEnd.next();
            if (!brandNewDrawing) {
                return;
            }
            this._syncToDb(brandNewDrawing)
                .then(innsertedId => {
                    this._stickyNote.registerMovingEvent(brandNewDrawing);
                });
        }
    }

    private _pencilEnd() {
        if (this._tool === PencilCommands.CommandName) {
            // TODO: Flow
            // TODO: Command via chat
            const brandNewDrawing = this._pencil.penUp();
            if (!brandNewDrawing) {
                return;
            }
            if (!this._stickyNote.attachToStickyNoteAsPossible(brandNewDrawing)) {
                this._syncToDb(brandNewDrawing)
                    .then(innsertedId => {
                        brandNewDrawing.addName(innsertedId);
                    });
            } else {
                const attachedTo = brandNewDrawing.getParent() as Konva.Group;
                const stickyNoteId = this._stickyNote.extractId(attachedTo);
                this._updateStickyNoteById(stickyNoteId, attachedTo);
            }
        }
    }
    private _updateStickyNoteById(stickyNoteId: string | undefined, attachedTo: Group) {
        if (!stickyNoteId) {
            return;
        }

       this._drawingObjects.detail(stickyNoteId)
        .then(drawingObject => {
            if (!drawingObject) {
                return;
            }
            drawingObject.konvaObject = attachedTo;
            this._drawingObjects.update(drawingObject);
        });
    }

    private _syncToDb(brandNewDrawing?: Konva.Shape | Konva.Group) {
        if (isNil(brandNewDrawing)) {
            return Promise.resolve("");
        }
        const newDrawingObject = new DrawingObject();
        const guid1 = guid.create();
        brandNewDrawing.addName(guid1);
        newDrawingObject.id = guid1.toString();
        newDrawingObject.boardId = this._boardId;
        newDrawingObject.konvaObject = brandNewDrawing;
        return this._drawingObjects.create(newDrawingObject)
            .then((x) => x.id);
    }

    setTool(tool: string) {
        this._tool = tool;
        this._setupSpecialCursor();
        this._stickyNote.setDraggable(this._tool !== PencilCommands.CommandName);
    }

    private _setupSpecialCursor() {
        if (this._tool !== StickyNoteCommands.CommandName) {
            this._stickyNote.detachPlaceholder();
            return;
        }

        this._stickyNote.attachStickyNotePlaceholder()
            .then(() => {
                this._cursor.grabbing();
                this._events.onCursorMove()
                    .subscribe((p) => {
                        this._stickyNote.movePlaceholder(p);
                    });
            })
    }
}
