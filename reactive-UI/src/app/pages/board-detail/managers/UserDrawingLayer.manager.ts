import Konva from "konva";
import { PRIMARY_COLOR } from "../../../configs/theme.constants";
import { PencilCommands } from "../commands/pencil.command";
import { BoardsService } from "../../../services/data-storages/boards.service";
import { UrlExtractorService } from "../../../services/browser/url-extractor.service";
import { ViewPortEventsManager } from "./ViewPortEvents.manager";
import { Injectable, OnDestroy } from "@angular/core";
import { KonvaObjectService } from "../../../services/3rds/konva-object.service";
import { DrawingObjectService } from "../../../services/data-storages/drawing-object.service";
import { StickyNoteCommands } from "../commands/sticky-notes.command";
import { CursorManager } from "./Cursor.manager";
import { Subject, debounceTime } from "rxjs";
import { Group } from "konva/lib/Group";
import guid from "guid";
import { ToolCompositionService } from "../../../services/states/tool-composition.service";
import { ComparisonResult, EventsCompositionService } from "../../../events/drawings/events-composition.service";
import { Line, LineConfig } from "konva/lib/shapes/Line";
import { AbstractEventQueueItem, BaseEvent, BoardedCreatedEvent, GeneralUndoEvent, InkAttachedToStickyNoteEvent, PencilUpEvent, StickyNoteMovedEvent, StickyNotePastedEvent, ToBaseEvent, ToDrawingEvent } from "../../../events/drawings/EventQueue";
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
        this._eventsCompositionService
            .setPencil(this._pencil)
            .setStickyNote(this._stickyNote);

        this._stickyNote.onStickyNoteMoved()
            .subscribe(id => {
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
                this._triggerUndoEvent();
            })
    }

    get tool() {
        return this._toolComposition.tool;
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
        this._syncingService.listen(this._boardId)
            .peerCheck(all.map(x => ToBaseEvent(x)!))
            .onEventAdded()
            .subscribe((allEvents) => {
                console.log(allEvents);
                this._synceBoardData(allEvents.filter(x => x instanceof BoardedCreatedEvent) as BoardedCreatedEvent[]);
                this._compareToCurrentState(allEvents);
            });
        this._eventsCompositionService
            .build(all);
    }
    private _synceBoardData(boardRelatedEvents: BoardedCreatedEvent[]) {
        boardRelatedEvents.forEach(e => {
            this.boards.detail(e.boardId)
                .then(existed => {
                    if (existed) {
                        return;
                    }

                    return this.boards.create(e.board);
                })
                .then(synced => {
                    console.log("sync", synced, e.board);
                });
        });
    }

    private _compareToCurrentState(allEvents: BaseEvent[]) {
        const comparison = this._eventsCompositionService.compare(allEvents.map(x => ToDrawingEvent(x)!));
        switch (comparison){
            // TODO: If they're equal -> ignore
            case ComparisonResult.EQUAL:
                return;
            // TODO: If the up coming is more than all -> do render, do save
            case ComparisonResult.ADDED:
                for (let i = this._eventsCompositionService.getQueueLength(); i < allEvents.length; ++i) {
                    this._insertIfNotExisted(allEvents, i);
                }
                return;
            // TODO: If they're conflict at some point -> replace the local storage, build all again with the up coming
            case ComparisonResult.CONFLICT:
                return;
            default:
                throw Error("Not handled", comparison);
        }
        
    }

    private _insertIfNotExisted(allEvents: BaseEvent[], i: number) {
        this._eventsService.detail(allEvents[i].id)
            .then((existed) => {
                if (!existed) {
                    this._eventsService.create(allEvents[i])
                        .then((justCreated) => {
                            this._eventsCompositionService.insert(ToDrawingEvent(allEvents[i])!);
                        });
                }
            });
    }

    // private async _recoverDrawingsOnLayer(x: Konva.Shape | Konva.Group) {
    //     let insertedPencil = this._pencil.parseFromJson(x as Konva.Shape);
    //     if (x?.className === 'Group' && (x.attrs.name + "").split(" ").includes(StickyNoteCommands.StickyNoteName)) {
    //         await this._stickyNote.parseFromJson(x as Konva.Group);
    //     }
    // }

    private _startSubscribingEvents() {
        this._events.onTouchStart()
            .subscribe((p) => {
                if (this._toolComposition.tool === PencilCommands.CommandName) {
                    this._pencil.penDown(p);
                }
            });
        this._events.onTouchMove()
            .subscribe((p) => {
                if (this._toolComposition.tool === PencilCommands.CommandName) {
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
        if (this._toolComposition.tool === StickyNoteCommands.CommandName) {
            const brandNewDrawing = this._stickyNote.putnew();
            this._drawingToolEnd.next();
            if (!brandNewDrawing) {
                return;
            }
            
            const newId = guid.create().toString();
            brandNewDrawing.addName(newId);
            this._triggerStickyNotePastedEvent(brandNewDrawing);
        }
    }

    private _pencilEnd() {
        if (this._toolComposition.tool === PencilCommands.CommandName) {
            // TODO: Flow
            // TODO: Command via chat
            const brandNewDrawing = this._pencil.penUp();
            if (!brandNewDrawing) {
                return;
            }
            const newId = guid.create().toString();
            brandNewDrawing.addName(newId);
            this._triggerPencilUpEvent(brandNewDrawing);
            const stickyNoteId = this._stickyNote.getFirstCollisionStickyNoteId(brandNewDrawing);
            if (stickyNoteId) {
                this._triggerInkAttachedToStickyNoteEvent(brandNewDrawing, stickyNoteId);
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
    
    private _triggerUndoEvent() {
        const event = new GeneralUndoEvent();
        event.boardId = this._boardId;
        this._generallyProcessNewEvent(event);
    }

    private _generallyProcessNewEvent(event: BaseEvent & AbstractEventQueueItem) {
        this._eventsService.create(event)
            .then((justCreated) => {
                event.id = justCreated.id;
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

    // private _updateStickyNoteById(stickyNoteId: string | undefined, attachedTo: Group) {
    //     if (!stickyNoteId) {
    //         return;
    //     }

    //    this._drawingObjects.detail(stickyNoteId)
    //     .then(drawingObject => {
    //         if (!drawingObject) {
    //             return;
    //         }
    //         drawingObject.konvaObject = attachedTo;
    //         this._drawingObjects.update(drawingObject);
    //     });
    // }

    // private _syncToDb(predefineId: string, brandNewDrawing?: Konva.Shape | Konva.Group) {
    //     if (isNil(brandNewDrawing)) {
    //         return Promise.resolve("");
    //     }
    //     const newDrawingObject = new DrawingObject();
    //     newDrawingObject.id = predefineId;
    //     newDrawingObject.boardId = this._boardId;
    //     newDrawingObject.konvaObject = brandNewDrawing;
    //     return this._drawingObjects.create(newDrawingObject)
    //         .then((x) => x.id);
    // }

    setTool(tool: string) {
        this._toolComposition.setTool(tool);
        this._setupSpecialCursor();
        this._stickyNote.setDraggable(this._toolComposition.tool !== PencilCommands.CommandName);
    }

    private _setupSpecialCursor() {
        if (this._toolComposition.tool !== StickyNoteCommands.CommandName) {
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
