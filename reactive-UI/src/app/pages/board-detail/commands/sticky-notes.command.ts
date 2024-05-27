import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';

export interface StickyNote {
    navtive: Konva.Group;
}

export class StickyNoteCommands {
    public static readonly CommandName = "stickynote";

    public putnew(position: Point) {
        
    }

    public select(stickyNote: StickyNote) {

    }

    public moveTo(stickynote: StickyNote, newPosition: Point) {

    }

    public setText(stickynote: StickyNote, text: string) {

    }

    public remove(stickynote: StickyNote) {

    }

    public attachedTo(stickynote: StickyNote, anotherStickyNote: StickyNote) {

    }
}