import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';
import { isNil } from 'lodash';

export interface StickyNote {
    navtive: Konva.Group;
}

export class StickyNoteCommands {
    public static readonly CommandName = "stickynote";
    private readonly _standardStickyNoteSize = 200;
    private readonly _placeholderName = "PLACEHOLDER";

    private readonly _stickyNotePlaceHolderName = ["STICKY_NOTE", this._placeholderName];

    constructor(private _foundation: Konva.Layer, private _drawingLayer: Konva.Layer) {
    }

    public putnew() {
        const placeholder = this._findCurrentPlaceholder();
        if (isNil(placeholder)) {
            return undefined;
        }
        const newKonvaObject = placeholder.clone() as Konva.Image;
        console.log(newKonvaObject);
        newKonvaObject.removeName(this._placeholderName)
        this._drawingLayer.add(placeholder?.clone());

        return newKonvaObject;
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

    public attachStickyNotePlaceholder(): Promise<Konva.Image> {
        const stickyNoteImageUrl = `/assets/stickynotes/${Math.ceil(Math.random() * 12).toString().padStart(2, "0")}.png`;
        return new Promise<Konva.Image>((res, rej) => {
            Konva.Image.fromURL(stickyNoteImageUrl, (image) => {
                const stickyNoteRatio = image.width() / image.height();
                image.width(this._standardStickyNoteSize);
                image.height(this._standardStickyNoteSize / stickyNoteRatio);
                this._stickyNotePlaceHolderName.forEach(n => image.addName(n));
                this._foundation.add(image);
                res(image);
            });
        });
    }

    public detachPlaceholder() {
        const o = this._findCurrentPlaceholder();
        o?.destroy();
    }

    private _findCurrentPlaceholder() {
        return this._foundation.children.find((o) => {
            return this._stickyNotePlaceHolderName.every(n => o.hasName(n));
        });
    }
}