import { SUPPORTED_COLORS } from '@config/theme.constants';
import { BaseEvent } from './BaseEvent';
import { EventCode } from './EventCode';
import { AbstractEventQueueItem } from './PureQueue.type';
import { BoardedCreatedEventPoco, PencilUpEventPoco, TextEnteredEventPoco, TextAttachedToStickyNoteEventPoco, StickyNotePastedEventPoco, InkAttachedToStickyNoteEventPoco, StickyNoteMovedEventPoco, GeneralUndoEventPoco } from '@ai/DrawingEvents.feedable';

export type SupportedColors = typeof SUPPORTED_COLORS[number];

export class BoardedCreatedEvent extends BoardedCreatedEventPoco implements AbstractEventQueueItem {
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

export class PencilUpEvent extends PencilUpEventPoco implements AbstractEventQueueItem {
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

export class TextEnteredEvent extends TextEnteredEventPoco implements AbstractEventQueueItem {
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
        this.skewX = itself.skewX;
        this.skewY = itself.skewY;
        this.rotation = itself.rotation;
    }
}

export class TextAttachedToStickyNoteEvent extends TextAttachedToStickyNoteEventPoco implements AbstractEventQueueItem {
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

export class StickyNotePastedEvent extends StickyNotePastedEventPoco implements AbstractEventQueueItem {
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

export class InkAttachedToStickyNoteEvent extends InkAttachedToStickyNoteEventPoco implements AbstractEventQueueItem {
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

export class StickyNoteMovedEvent extends StickyNoteMovedEventPoco implements AbstractEventQueueItem {
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

export class GeneralUndoEvent extends GeneralUndoEventPoco implements AbstractEventQueueItem {
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