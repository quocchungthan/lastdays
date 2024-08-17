import { Dimension } from "../../../utilities/types/Dimension";
import { Point } from "../../../utilities/types/Point";
import { STANDARD_STICKY_NOTE_SIZE, STROKE_WIDTH } from "../../../configs/size";
import { PREFERED_INK_COLOR, SUPPORTED_COLORS } from "../../../configs/theme.constants";
import { BaseEntity } from "../../services/data-storages/entities/Base.entity";
import { Board } from "../../services/data-storages/entities/Board";
import { EventCode } from "./EventCode";

export type SupportedColors = typeof SUPPORTED_COLORS[number];

export interface AbstractEventQueueItem {
    code: EventCode;
    targetId: string;
    id: string;
}

export class BaseEvent extends BaseEntity {
    createdByUserId: string = '';
    boardId: string = '';
    constructor(itself?: BaseEvent) {
        super();
        if (!itself) {
            return;
        }

        if (typeof(itself.modifiedTime) === 'string') {
          this.modifiedTime = new Date(Date.parse(itself.modifiedTime));
        } else {
          this.modifiedTime = itself.modifiedTime;
        }
        this.boardId = itself.boardId;
        this.createdByUserId = itself.createdByUserId;
        this.id = itself.id;
        
    }
}

export type PureQueue = Array<AbstractEventQueueItem>;

export class BoardedCreatedEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.BoardCreated;
    targetId: string = '';
    board: Board = new Board();

    constructor();
    constructor(itself: BoardedCreatedEvent);

    constructor(itself?: BoardedCreatedEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.board = itself.board;
    }
}

export class PencilUpEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.PencilUp;
    targetId: string = '';
    points: number[] = [];
    color: SupportedColors = PREFERED_INK_COLOR;
    width: number = STROKE_WIDTH;

    constructor();
    constructor(itself: PencilUpEvent);

    constructor(itself?: PencilUpEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.points = itself.points;
        this.color = itself.color;
        this.width = itself.width;
    }
}

export class TextEnteredEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.TextEntered;
    targetId: string = '';
    text: string = '';
    color: SupportedColors = PREFERED_INK_COLOR;
    position: Point = { x: 0, y: 0 };
    containerWidth: number = 0;
    containerheight: number = 0;

    constructor();
    constructor(itself: TextEnteredEvent);

    constructor(itself?: TextEnteredEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.text = itself.text;
        this.color = itself.color;
        this.containerWidth = itself.containerWidth;
        this.containerheight = itself.containerheight;
        this.position = itself.position;
    }
}

export class TextAttachedToStickyNoteEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.TextAttachedToStickyNote;
    targetId: string = '';
    targetStickyNoteId: string = '';    

    constructor();
    constructor(itself: TextAttachedToStickyNoteEvent);

    constructor(itself?: TextAttachedToStickyNoteEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.targetStickyNoteId = itself.targetStickyNoteId;
    }
}

export class StickyNotePastedEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.StickyNotePasted;
    targetId: string = '';
    backgroundUrl: string = '';
    position: Point = { x: 0, y: 0 };
    dimention: Dimension = { width: STANDARD_STICKY_NOTE_SIZE, height: STANDARD_STICKY_NOTE_SIZE };
    
    constructor();
    constructor(itself: StickyNotePastedEvent);

    constructor(itself?: StickyNotePastedEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.backgroundUrl = itself.backgroundUrl;
        this.position = itself.position;
        this.dimention = itself.dimention;
    }
}

export class InkAttachedToStickyNoteEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.InkAttachedToStickyNote;
    targetId: string = '';
    targetStickyNoteId: string = '';    

    constructor();
    constructor(itself: InkAttachedToStickyNoteEvent);

    constructor(itself?: InkAttachedToStickyNoteEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.targetStickyNoteId = itself.targetStickyNoteId;
    }
}

export class StickyNoteMovedEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.StickyNoteMoved;
    targetId: string = '';
    newPosition: Point = { x: 0, y: 0 };    
    
    constructor();
    constructor(itself: StickyNoteMovedEvent);

    constructor(itself?: StickyNoteMovedEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
        this.newPosition = itself.newPosition;
    }
}

export class GeneralUndoEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.GENERAL_UNDO;
    targetId: string = '';
    
    constructor();
    constructor(itself: GeneralUndoEvent);

    constructor(itself?: GeneralUndoEvent) {
        super(itself);
        if (!itself) {
            return;
        }
        this.code = itself.code;
        this.targetId = itself.targetId;
    }
}

export function ToBaseEvent(abstractDrawingItem: AbstractEventQueueItem): BaseEvent | null {
    if (abstractDrawingItem instanceof GeneralUndoEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof StickyNotePastedEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof StickyNoteMovedEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof PencilUpEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof InkAttachedToStickyNoteEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof TextEnteredEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof TextAttachedToStickyNoteEvent) {
        return abstractDrawingItem;
    }
    if (abstractDrawingItem instanceof BoardedCreatedEvent) {
        return abstractDrawingItem;
    }

    if (Object.hasOwn(abstractDrawingItem, "createdByUserId") 
        && Object.hasOwn(abstractDrawingItem, "boardId") 
        && Object.hasOwn(abstractDrawingItem, "id") 
        && Object.hasOwn(abstractDrawingItem, "modifiedTime")) {

        // @ts-ignore
        return abstractDrawingItem;
    }

    return null;
}

export function ParseToBaseEvent(rawEvent: any): BaseEvent | null {
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.GENERAL_UNDO) {
        return new GeneralUndoEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.StickyNotePasted) {
        return new StickyNotePastedEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.StickyNoteMoved) {
        return new StickyNoteMovedEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.PencilUp) {
        return new PencilUpEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.InkAttachedToStickyNote) {
        return new InkAttachedToStickyNoteEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.TextEntered) {
        return new TextEnteredEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.TextAttachedToStickyNote) {
        return new TextAttachedToStickyNoteEvent(rawEvent);
    }
    if (Object.hasOwn(rawEvent,'code') && rawEvent.code === EventCode.BoardCreated) {
        return new BoardedCreatedEvent(rawEvent);
    }

    if (Object.hasOwn(rawEvent, "createdByUserId") 
        && Object.hasOwn(rawEvent, "boardId") 
        && Object.hasOwn(rawEvent, "id") 
        && Object.hasOwn(rawEvent, "modifiedTime")) {

        // @ts-ignore
        return abstractDrawingItem;
    }

    return null;
}

export function ToDrawingEvent(event: BaseEvent): AbstractEventQueueItem | null {
    if (event instanceof GeneralUndoEvent) {
        return event;
    }
    if (event instanceof StickyNotePastedEvent) {
        return event;
    }
    if (event instanceof StickyNoteMovedEvent) {
        return event;
    }
    if (event instanceof PencilUpEvent) {
        return event;
    }
    if (event instanceof InkAttachedToStickyNoteEvent) {
        return event;
    }
    if (event instanceof TextEnteredEvent) {
        return event;
    }
    if (event instanceof TextAttachedToStickyNoteEvent) {
        return event;
    }
    if (event instanceof BoardedCreatedEvent) {
        return event;
    }

    if (Object.hasOwn(event, "code") 
        && Object.hasOwn(event, "targetId") ) {
        // @ts-ignore
        const casted = event as AbstractEventQueueItem;
        if (casted.code === EventCode.BoardCreated) {
            return new BoardedCreatedEvent(casted as BoardedCreatedEvent)
        }
        if (casted.code === EventCode.GENERAL_UNDO) {
            return new GeneralUndoEvent(casted as GeneralUndoEvent)
        }
        if (casted.code === EventCode.StickyNoteMoved) {
            return new StickyNoteMovedEvent(casted as StickyNoteMovedEvent)
        }
        if (casted.code === EventCode.StickyNotePasted) {
            return new StickyNotePastedEvent(casted as StickyNotePastedEvent)
        }
        if (casted.code === EventCode.PencilUp) {
            return new PencilUpEvent(casted as PencilUpEvent)
        }
        if (casted.code === EventCode.InkAttachedToStickyNote) {
            return new InkAttachedToStickyNoteEvent(casted as InkAttachedToStickyNoteEvent)
        }
        if (casted.code === EventCode.TextEntered) {
            return new TextEnteredEvent(casted as TextEnteredEvent)
        }
        if (casted.code === EventCode.TextAttachedToStickyNote) {
            return new TextAttachedToStickyNoteEvent(casted as TextAttachedToStickyNoteEvent)
        }
    }
    return null;
}