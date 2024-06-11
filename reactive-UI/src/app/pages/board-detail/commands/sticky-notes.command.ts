import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';
import { isNil } from 'lodash';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Image } from 'konva/lib/shapes/Image';

export interface StickyNote {
    navtive: Konva.Group;
}

export class StickyNoteCommands {
    public static readonly CommandName = "stickynote";
    public static readonly UrlAttrName = "stickynoteUrl";
    private readonly _standardStickyNoteSize = 200;
    private readonly _placeholderName = "PLACEHOLDER";

    private readonly _stickyNoteName = "STICKY_NOTE";

    private readonly _stickyNotePlaceHolderName = [this._stickyNoteName, this._placeholderName];

    constructor(private _foundation: Konva.Layer, private _drawingLayer: Konva.Layer) {
    }

    public putnew() {
        const placeholder = this._findCurrentPlaceholder();
        if (isNil(placeholder)) {
            return undefined;
        }
        const newKonvaObject = placeholder.clone() as Konva.Image;
        newKonvaObject.removeName(this._placeholderName)
        this._drawingLayer.add(newKonvaObject);
        this._draggableImage(newKonvaObject);
        return newKonvaObject;
    }

    parseFromJson(shape: Shape<ShapeConfig>): Promise<void> {
        if (shape.attrs.name !== this._stickyNoteName || !shape.attrs[StickyNoteCommands.UrlAttrName]) {
            return Promise.resolve();
        }

        return new Promise<void>((res, rej) => {
            Konva.Image.fromURL(shape.attrs[StickyNoteCommands.UrlAttrName], (image) => {
                this._adjustImage(image);
                image.x(shape.attrs.x);
                image.y(shape.attrs.y);
                image.addName(shape.attrs.name);
                this._drawingLayer.add(image);
                this._draggableImage(image);
                res();
            });
        });
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
                this._adjustImage(image);
                this._stickyNotePlaceHolderName.forEach(n => image.addName(n));
                this._foundation.add(image);
                res(image);
            });
        });
    }

    private _draggableImage(newKonvaObject: Image) {
        newKonvaObject.draggable(true);
    }

    private _adjustImage(image: Konva.Image) {
        const stickyNoteRatio = image.width() / image.height();
        image.width(this._standardStickyNoteSize);
        image.height(this._standardStickyNoteSize / stickyNoteRatio);
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