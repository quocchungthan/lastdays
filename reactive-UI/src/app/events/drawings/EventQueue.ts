import { Dimension } from "../../../ultilities/types/Dimension";
import { Point } from "../../../ultilities/types/Point";
import { STANDARD_STICKY_NOTE_SIZE, STROKE_WIDTH } from "../../configs/size";
import { PREFERED_INK_COLOR, SUPPORTED_COLORS } from "../../configs/theme.constants";
import { BaseEntity } from "../../services/data-storages/entities/Base.entity";
import { Board } from "../../services/data-storages/entities/Board";
import { EventCode } from "./EventCode";

export type SupportedColors = typeof SUPPORTED_COLORS[number];

export interface AbstractEventQueueItem {
    code: EventCode;
    targetId: string;
}

export class BaseEvent extends BaseEntity {
    createdByUserId: string = '';
    boardId: string = '';
}

export type PureQueue = Array<AbstractEventQueueItem>;

export class BoardedCreatedEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.BoardCreated;
    targetId: string = '';
    board: Board = new Board();
}

export class PencilUpEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.PencilUp;
    targetId: string = '';
    points: number[] = [];
    color: SupportedColors = PREFERED_INK_COLOR;
    width: number = STROKE_WIDTH;
}

export class StickyNotePastedEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.StickyNotePasted;
    targetId: string = '';
    backgroundUrl: string = '';
    position: Point = { x: 0, y: 0 };
    dimention: Dimension = { width: STANDARD_STICKY_NOTE_SIZE, height: STANDARD_STICKY_NOTE_SIZE };
}

export class InkAttachedToStickyNoteEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.InkAttachedToStickyNote;
    targetId: string = '';
    targetStickyNoteId: string = '';
}

export class StickyNoteMovedEvent extends BaseEvent implements AbstractEventQueueItem {
    code: EventCode = EventCode.StickyNoteMoved;
    targetId: string = '';
    newPosition: Point = { x: 0, y: 0 };
}
