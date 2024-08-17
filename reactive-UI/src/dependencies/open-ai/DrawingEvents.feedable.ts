import { Board } from '@uidata/entities/Board';
import { Point } from '@ui/types/Point';
import { Dimension } from '@ui/types/Dimension';
import { EventCode } from '@drawings/EventCode';
import { BaseEvent } from '@drawings/BaseEvent';

// Array string of hex colors
import { SupportedColors } from '../../app/events/drawings/EventQueue';
// One of the favorite color in the list above
import { PREFERED_INK_COLOR } from '@config/theme.constants';
// Config numbers for default values
import { STANDARD_STICKY_NOTE_SIZE, STROKE_WIDTH } from '@config/size';


export class BoardedCreatedEventPoco extends BaseEvent {
    code: EventCode = EventCode.BoardCreated;
    targetId: string = '';
    board: Board = new Board();
}

export class PencilUpEventPoco extends BaseEvent {
    code: EventCode = EventCode.PencilUp;
    targetId: string = '';
    points: number[] = [];
    color: SupportedColors = PREFERED_INK_COLOR;
    width: number = STROKE_WIDTH;
}

export class TextEnteredEventPoco extends BaseEvent {
    code: EventCode = EventCode.TextEntered;
    targetId: string = '';
    text: string = '';
    color: SupportedColors = PREFERED_INK_COLOR;
    position: Point = { x: 0, y: 0 };
    containerWidth: number = 0;
    containerheight: number = 0;
}

export class TextAttachedToStickyNoteEventPoco extends BaseEvent {
    code: EventCode = EventCode.TextAttachedToStickyNote;
    targetId: string = '';
    targetStickyNoteId: string = '';
}

export class StickyNotePastedEventPoco extends BaseEvent {
    code: EventCode = EventCode.StickyNotePasted;
    targetId: string = '';
    backgroundUrl: string = '';
    position: Point = { x: 0, y: 0 };
    dimention: Dimension = { width: STANDARD_STICKY_NOTE_SIZE, height: STANDARD_STICKY_NOTE_SIZE };
}



export class InkAttachedToStickyNoteEventPoco extends BaseEvent {
    code: EventCode = EventCode.InkAttachedToStickyNote;
    targetId: string = '';
    targetStickyNoteId: string = '';    
}

export class StickyNoteMovedEventPoco extends BaseEvent {
    code: EventCode = EventCode.StickyNoteMoved;
    targetId: string = '';
    newPosition: Point = { x: 0, y: 0 };    
}

export class GeneralUndoEventPoco extends BaseEvent {
    code: EventCode = EventCode.GENERAL_UNDO;
    targetId: string = '';
}