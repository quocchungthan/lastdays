import Konva from "konva";
import { Injectable, OnDestroy } from "@angular/core";
import { CursorManager } from "./Cursor.manager";
import { Subject, debounceTime, takeUntil } from "rxjs";
import { Group } from "konva/lib/Group";
import guid from "guid";
import { Line, LineConfig } from "konva/lib/shapes/Line";
import { SyncingService } from '@com/syncing.service';
import { PRIMARY_COLOR } from '@config/theme.constants';
import { FormModalService } from '@ui/controls/form-modal.service';
import { Point } from '@ui/types/Point';
import { DrawingObjectService } from '@uidata/drawing-object.service';
import { EventsService } from '@uidata/events.service';
import { BoardsService } from '@uidata/boards.service';
import { KeysService } from '@browser/keys.service';
import { MetaService } from '@browser/meta.service';
import { UrlExtractorService } from '@browser/url-extractor.service';
import { PencilCommands } from '@canvas-module/commands/pencil.command';
import { StickyNoteCommands } from '@canvas-module/commands/sticky-notes.command';
import { TextInputCommands } from '@canvas-module/commands/text-input.command';
import { KonvaObjectService } from '@canvas-module/services/3rds/konva-object.service';
import { BaseEvent } from '@drawings/BaseEvent';
import { ToBaseEvent, BoardedCreatedEvent, ToDrawingEvent, StickyNoteMovedEvent, GeneralUndoEvent, InkAttachedToStickyNoteEvent, TextAttachedToStickyNoteEvent, PencilUpEvent, TextEnteredEvent } from '@drawings/EventQueue';
import { EventsCompositionService } from '@drawings/events-composition.service';
import { AbstractEventQueueItem } from '@drawings/PureQueue.type';
import { ToolCompositionService } from '@states/tool-composition.service';
import { ViewPortEventsManager } from './ViewPortEvents.manager';
import { CANVAS_CHANGE_THROTTLE_TIME } from "@config/delay.constants";
import { BoardPreviewsService } from "@uidata/boardPreviews.service";

@Injectable()
export class UserDrawingLayerManager implements OnDestroy {
    private unsubscribe$ = new Subject<void>();
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
    private _textInput: TextInputCommands;

    // TODO: bloaster
    constructor(
        _konvaObjects: KonvaObjectService,
        private _events: ViewPortEventsManager, 
        private boards: BoardsService,
        private _cursor: CursorManager,
        private _urlExtractor: UrlExtractorService,
        private _drawingObjects: DrawingObjectService,
        private _toolComposition: ToolCompositionService,
        private _metaService: MetaService,
        private _eventsCompositionService: EventsCompositionService,
        private _eventsService: EventsService,
        private _syncingService: SyncingService,
        private _formModalService: FormModalService,
        private _boardPreviews: BoardPreviewsService,
        private _keys: KeysService) {
        this._drawingLayer = new Konva.Layer({name: "DRAWING_LAYER"});
        this._placeholderLayer = new Konva.Layer();
        this._pencil = new PencilCommands(this._drawingLayer, _toolComposition);
        this._textInput = new TextInputCommands(this._drawingLayer, _toolComposition, this._formModalService);
        this._stickyNote = new StickyNoteCommands(this._placeholderLayer, this._drawingLayer, _toolComposition, this._formModalService);
        this._eventsCompositionService
            .setPencil(this._pencil)
            .setStickyNote(this._stickyNote)
            .setTextInputCommand(this._textInput);

        this._stickyNote.onStickyNoteMoved()
            .pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
                this._triggerEventStickyNoteMoved(id);
            });
        _konvaObjects.viewPortChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(s => {
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
            .pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
                if (this._boardId !== id) {
                    this._boardId = id;
                    this._loadExistingDrawings();
                }

                if (!id) {
                    this._syncingService.disconnect();
                }
            });

        this._keys.onUndo()
            .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
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
        this._textInput.cleanUpGarbage();
        this._stickyNote.cleanUpGarbage();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    generallyProcessNewEvent(event: BaseEvent & AbstractEventQueueItem) {
        return this._eventsService.create(event)
            .then((justCreated) => {
                event.id = justCreated.id;
                this._eventsCompositionService.insert(event);
                this._syncingService.trySendEvent(event);
            });
    }

    private _loadExistingDrawings() {
        if (!this._boardId) {
            return;
        }

        // TODO: feed the composition.build method here
        this._loadDrawingObjectsAsync()
            .then(() => {
                // console.log('loaded');
            });
    }
    
    private async _loadDrawingObjectsAsync() {
        const all = await this._eventsService.indexAndMap(this._boardId);
        this._eventsCompositionService.getLocalQueueChanged()
            .pipe(debounceTime(CANVAS_CHANGE_THROTTLE_TIME))
            .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
                this._capturePreview();
            });
        this._syncingService.listen(this._boardId)
            .peerCheck(all.map(x => ToBaseEvent(x)!))
        this._syncingService.onEventAdded()
            .pipe(takeUntil(this.unsubscribe$)).subscribe((newEvent) => {
                if (newEvent instanceof BoardedCreatedEvent) {
                    this._synceBoardData([newEvent]);
                }
                this._insertIfNotExisted(newEvent);
            });
        this._syncingService.onEventsReset()
            .pipe(takeUntil(this.unsubscribe$)).subscribe((allEvents) => {
                this._synceBoardData(allEvents.filter(x => x instanceof BoardedCreatedEvent) as BoardedCreatedEvent[]);
                this._overwriteEventsByBoardId(allEvents)
                    .then(() => {
                        console.log('after overwriting');
                    });
                this._eventsCompositionService
                    .build(allEvents.map(x => ToDrawingEvent(x)!));
            });
        this._eventsCompositionService
            .build(all);
    }
    private _capturePreview() {
        const dataURL = this._viewPort.toDataURL();
        this._boardPreviews.saveOrUpdateByBoardId(this._boardId, dataURL)
            .then(() => {});
    }
    private async _overwriteEventsByBoardId(allEvents: BaseEvent[]) {
        const listEventsOfCurrentBoard = await this._eventsService.indexAndMap(this._boardId);
        for (let e of listEventsOfCurrentBoard) {
            await this._eventsService.delete(e.id);
        }
        for (let e of allEvents) {
            await this._eventsService.create(e);
        }
        console.log('done overwriting');
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
                    // console.log("sync", synced, e.board);
                })
                .finally(() => {
                    this._metaService.setPageName("Board - " + e.board.name);
                });
        });
    }

    private _insertIfNotExisted(event: BaseEvent) {
        this._eventsService.detail(event.id)
            .then((existed) => {
                if (!existed) {
                    return this._eventsService.create(event)
                        .then((justCreated) => {});
                }

                return Promise.resolve();
            })
            .finally(() => {
                this._eventsCompositionService.insert(ToDrawingEvent(event)!);
            });
    }

    private _startSubscribingEvents() {
        this._events.onTouchStart()
            .pipe(takeUntil(this.unsubscribe$)).subscribe((p) => {
                if (this._toolComposition.tool === PencilCommands.CommandName) {
                    this._pencil.penDown(p);
                }
            });
        this._events.onTouchMove()
            .pipe(takeUntil(this.unsubscribe$)).subscribe((p) => {
                if (this._toolComposition.tool === PencilCommands.CommandName) {
                    this._pencil.penMove(p);
                }
            });

        this._events.onTouchEnd()
            .pipe(takeUntil(this.unsubscribe$)).subscribe((p) => {
                this._pencilEnd();
                this._stickyNoteEnd(p);
                this._textInputStart(p);
            });
        this._events.onMouseOut()
            .pipe(takeUntil(this.unsubscribe$)).subscribe((p) => {
                this._pencilEnd();
            });
    }
    /* TODO: move to command class, tool should owns its logic, DI necessary?
    - If so, we manage the dependency of the Commands in a special service.
    - So far some Layer we created by the `new` keyword
        this._drawingLayer = new Konva.Layer();
        this._placeholderLayer = new Konva.Layer();
    */
    private _textInputStart(p: Point) {
        if (this._toolComposition.tool === TextInputCommands.CommandName) {
            this._drawingToolEnd.next();
            this._textInput.renderComponentAndFocus(p)
                .pipe(takeUntil(this.unsubscribe$)).subscribe((newObjectNeedToBeSaved) => {
                    // New guid
                    // Check if it can paste onto a sticky note
                    // Trigger event
                    // Save to db
                    // Sync to others
                    const newId = guid.create().toString();
                    newObjectNeedToBeSaved.addName(newId);
                    this._triggerTextEnteredEvent(newObjectNeedToBeSaved);
                    const stickyNoteId = this._stickyNote.getFirstCollisionStickyNoteId(newObjectNeedToBeSaved);
                    if (stickyNoteId) {
                        this._triggerTextAttachedToStickyNoteEvent(newObjectNeedToBeSaved, stickyNoteId);
                        this._drawingToolEnd.next();
                    }
                });
        }
    }

    // TODO: move to command class, tool should owns its logic
    private _stickyNoteEnd(p: Point) {
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

    // TODO: move to command class, tool should owns its logic
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
        this.generallyProcessNewEvent(event);
    }
    
    private _triggerUndoEvent() {
        const event = new GeneralUndoEvent();
        event.boardId = this._boardId;
        this.generallyProcessNewEvent(event);
    }

    private _triggerStickyNotePastedEvent(brandNewDrawing: Group) {
        const event = StickyNoteCommands.buildEvent(brandNewDrawing, this._boardId, this._stickyNote.extractId(brandNewDrawing));
        this.generallyProcessNewEvent(event);
    }

    private _triggerInkAttachedToStickyNoteEvent(brandNewDrawing: Line<LineConfig>, stickyNoteId: string) {
        const event = new InkAttachedToStickyNoteEvent();
        event.targetId = this._pencil.extractId(brandNewDrawing);
        event.boardId = this._boardId;
        event.targetStickyNoteId = stickyNoteId;

        this.generallyProcessNewEvent(event);
    }

    private _triggerTextAttachedToStickyNoteEvent(brandNewDrawing: Konva.Text, stickyNoteId: string) {
        const event = new TextAttachedToStickyNoteEvent();
        event.targetId = this._textInput.extractId(brandNewDrawing);
        event.boardId = this._boardId;
        event.targetStickyNoteId = stickyNoteId;

        this.generallyProcessNewEvent(event);
    }

    private _triggerPencilUpEvent(brandNewDrawing: Line<LineConfig>) {
        const newEvent = PencilCommands.buildEvent(brandNewDrawing, this._boardId, this._pencil.extractId(brandNewDrawing));

        this.generallyProcessNewEvent(newEvent);
    }

    private _triggerTextEnteredEvent(brandNewDrawing: Konva.Text) {
        const event = TextInputCommands.buildEvent(brandNewDrawing, this._boardId, this._textInput.extractId(brandNewDrawing));

        this.generallyProcessNewEvent(event);
    }

    setTool(tool: string) {
        this._toolComposition.setTool(tool);
        this._setupSpecialCursor();
        // TODO: write test to cover drag function when user picked not write tool
        this._stickyNote.setDraggable(![PencilCommands.CommandName, TextInputCommands.CommandName].includes(this._toolComposition.tool));
    }

    private _setupSpecialCursor() {
        if (this._toolComposition.tool !== StickyNoteCommands.CommandName) {
            this._stickyNote.detachPlaceholder();
            return;
        }
        const currentStagePosition = this._viewPort.position();
        currentStagePosition.x /= this._viewPort.scaleX();
        currentStagePosition.y /= this._viewPort.scaleX();
        this._stickyNote.attachStickyNotePlaceholder({
            x: this._viewPort.width() / 2 - currentStagePosition.x,
            y: this._viewPort.height() / 2 - currentStagePosition.y
        })
            .then(() => {
                this._cursor.grabbing();
                this._events.onCursorMove()
                    .pipe(takeUntil(this.unsubscribe$)).subscribe((p) => {
                        this._stickyNote.movePlaceholder(p);
                    });
            });
    }
}
