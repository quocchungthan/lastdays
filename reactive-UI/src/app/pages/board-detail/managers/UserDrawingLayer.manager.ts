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
import { EventsCompositionService } from "../../../events/drawings/events-composition.service";
import { Line, LineConfig } from "konva/lib/shapes/Line";
import { AbstractEventQueueItem, BaseEvent, InkAttachedToStickyNoteEvent, PencilUpEvent, StickyNoteMovedEvent, StickyNotePastedEvent } from "../../../events/drawings/EventQueue";
import { EventsService } from "../../../services/data-storages/events.service";
import { SyncingService } from "../../../events/drawings/syncing.service";
import { KeysService } from "../../../services/browser/keys.service";

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
        private _toolComposition: ToolCompositionService,
        private _eventsCompositionService: EventsCompositionService,
        private _eventsService: EventsService,
        private _syncingService: SyncingService,
        private _keys: KeysService) {
        this._drawingLayer = new Konva.Layer();
        this._placeholderLayer = new Konva.Layer();
        this._pencil = new PencilCommands(this._drawingLayer, _toolComposition);
        this._stickyNote = new StickyNoteCommands(this._placeholderLayer, this._drawingLayer, _toolComposition);
        this._stickyNote.onStickyNoteMoved()
            .subscribe(id => {
                this._updateStickyNoteById(id, this._stickyNote.getStickyNoteById(id));
                this._triggerEventStickyNoteMoved(id);
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

        this._keys.onUndo()
            .subscribe(() => {
                alert('undo');
            })
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

        // TODO: feed the composition.build method here
        // this._eventsCompositionService.build()
        this._loadDrawingObjectsAsync()
            .then(() => {
                console.log('loaded');
            });
        // this._drawingObjects.index()
        //     .then(async (all) => {
        //         for (let o of all.filter(x => x.boardId === this._boardId).map(x => x.konvaObject)) {
        //             if (!o) {
        //                 continue;
        //             }

        //             if (typeof o === 'string') {
        //                 const parsed = JSON.parse(o) as Konva.Shape | Konva.Group;
        //                 await this._recoverDrawingsOnLayer(parsed);
        //             } else {
        //                 await this._recoverDrawingsOnLayer(o);
        //             }
        //         }
        //     });
    }
    
    private async _loadDrawingObjectsAsync() {
        const all = await this._eventsService.indexAndMap(this._boardId);
        console.log(all);
        this._eventsCompositionService
            .setPencil(this._pencil)
            .setStickyNote(this._stickyNote)
            .build(all);
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
            
            const newId = guid.create().toString();
            brandNewDrawing.addName(newId);
            this._triggerStickyNotePastedEvent(brandNewDrawing);
            this._syncToDb(newId, brandNewDrawing)
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
            const newId = guid.create().toString();
            brandNewDrawing.addName(newId);
            this._triggerPencilUpEvent(brandNewDrawing);
            if (!this._stickyNote.attachToStickyNoteAsPossible(brandNewDrawing)) {
                this._syncToDb(newId, brandNewDrawing)
                    .then(innsertedId => {
                        brandNewDrawing.addName(innsertedId);
                    });
            } else {
                const attachedTo = brandNewDrawing.getParent() as Konva.Group;
                const stickyNoteId = this._stickyNote.extractId(attachedTo);
                this._triggerInkAttachedToStickyNoteEvent(brandNewDrawing, stickyNoteId);
                this._updateStickyNoteById(stickyNoteId, attachedTo);
            }
        }
    }

    private _triggerEventStickyNoteMoved(id: string) {
        const event = new StickyNoteMovedEvent();
        const stickyNote = this._stickyNote.getStickyNoteById(id);
        event.targetId = id;
        event.boardId = this._boardId;
        event.newPosition = stickyNote.position();
        this._generallyProcessNewEvent(event);
    }

    private _generallyProcessNewEvent(event: BaseEvent & AbstractEventQueueItem) {
        this._eventsService.create(event)
            .then((justCreated) => {
                this._eventsCompositionService.insert(event);
                this._syncingService.trySendEvent(event);
            });
    }

    private _triggerStickyNotePastedEvent(brandNewDrawing: Group) {
        const event = new StickyNotePastedEvent();
        const background = this._stickyNote.extractBackground(brandNewDrawing);
        event.targetId = this._stickyNote.extractId(brandNewDrawing);
        event.boardId = this._boardId;
        event.backgroundUrl = background.attrs.image.currentSrc;
        event.dimention = {
            width: background.width(),
            height: background.height(),
        };
        event.position = brandNewDrawing.position();
        this._generallyProcessNewEvent(event);
    }

    private _triggerInkAttachedToStickyNoteEvent(brandNewDrawing: Line<LineConfig>, stickyNoteId: string) {
        const event = new InkAttachedToStickyNoteEvent();
        event.targetId = this._pencil.extractId(brandNewDrawing);
        event.boardId = this._boardId;
        event.targetStickyNoteId = stickyNoteId;

        this._generallyProcessNewEvent(event);
    }

    private _triggerPencilUpEvent(brandNewDrawing: Line<LineConfig>) {
        const event = new PencilUpEvent();
        event.targetId = this._pencil.extractId(brandNewDrawing);
        event.boardId = this._boardId;
        event.points = [...brandNewDrawing.points()];
        event.color = brandNewDrawing.stroke();
        event.width = brandNewDrawing.strokeWidth();

        this._generallyProcessNewEvent(event);
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

    private _syncToDb(predefineId: string, brandNewDrawing?: Konva.Shape | Konva.Group) {
        if (isNil(brandNewDrawing)) {
            return Promise.resolve("");
        }
        const newDrawingObject = new DrawingObject();
        newDrawingObject.id = predefineId;
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
