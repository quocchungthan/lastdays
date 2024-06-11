import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';
import { isNil } from 'lodash';
import { Shape, ShapeConfig, shapes } from 'konva/lib/Shape';
import { areRectanglesIntersecting } from '../../../../ultilities/mathematicals/collision';
import { PencilCommands } from './pencil.command';
import { Subject } from 'rxjs';
import { Group } from 'konva/lib/Group';

export interface StickyNote {
    navtive: Konva.Group;
}

export class StickyNoteCommands {
    public static readonly CommandName = "stickynote";
    public static readonly BackgroundUrlAttrName = "stickynoteUrl";
    private readonly _standardStickyNoteSize = 200;
    private readonly _placeholderName = "PLACEHOLDER";
    public static StickyNoteName = "STICKY_NOTE";
    public static StickyNoteBackgroundName = "STICKY_NOTE_BACKGROUND";
    public static StickNoteOffsetToContent = 10;

    private readonly _stickyNotePlaceHolderName = [StickyNoteCommands.StickyNoteName, this._placeholderName];
    private _internalPencil: PencilCommands;
    private _justMovedStickyNote = new Subject<string>();

    constructor(private _foundation: Konva.Layer, private _drawingLayer: Konva.Layer) {
        this._internalPencil = new PencilCommands(this._drawingLayer);
    }

    public onStickyNoteMoved() {
        return this._justMovedStickyNote.asObservable();
    }

    public putnew() {
        const placeholder = this._findCurrentPlaceholder();
        if (isNil(placeholder)) {
            return undefined;
        }
        const newKonvaObject = placeholder.clone() as Konva.Group;
        newKonvaObject.removeName(this._placeholderName);
        this._drawingLayer.add(newKonvaObject);
        this._draggableImage(newKonvaObject);
        return newKonvaObject;
    }

    attachToStickyNoteAsPossible(shape: Shape<ShapeConfig>) {
        const foundStickyNoteAsBackground = this._allPastedStickyNotes().find(stickyNote => {
            return this._isIntersect(shape, stickyNote);
        });

        if (isNil(foundStickyNoteAsBackground)) {
            return false;
        }
        if (shape instanceof Konva.Line) {
            const shapePointsWithinStickyNote = shape.points();
            for (let i = 0; i < shapePointsWithinStickyNote.length; i += 2) {
                shapePointsWithinStickyNote[i] -= foundStickyNoteAsBackground.x();
                shapePointsWithinStickyNote[i + 1] -= foundStickyNoteAsBackground.y();
            }
            shape.points(shapePointsWithinStickyNote)
        }
        foundStickyNoteAsBackground.add(shape);

        return true;
    }

    public movePlaceholder(p: Point) {
        const placeholder = this._findCurrentPlaceholder() as Konva.Group;
        if (!placeholder) {
            return;
        }

        if (!placeholder.visible()) {
            return;
        }

        const background = this._extractBackground(placeholder);
        // only background has size
        placeholder.position({x: p.x - background.width() / 2, y: p.y - background.height() / 2});
    }

    private _extractBackground(placeholder: Konva.Group) {
        return placeholder.children.find(x => x instanceof Konva.Image)!;
    }

    parseFromJson(shape: Konva.Group): Promise<void> {
        if (!(shape.attrs.name + "").includes(StickyNoteCommands.StickyNoteName) || !shape.attrs[StickyNoteCommands.BackgroundUrlAttrName]) {
            return Promise.resolve();
        }

        return new Promise<void>((res, rej) => {
            Konva.Image.fromURL(shape.attrs[StickyNoteCommands.BackgroundUrlAttrName], (image) => {
                var placeholder = this._adjustImage(image);
                placeholder.x(shape.attrs.x);
                placeholder.y(shape.attrs.y);
                placeholder.addName(shape.attrs.name);
                this._drawingLayer.add(placeholder);
                this._draggableImage(placeholder);
                // TODO: have to clean this up before merge
                shape.children?.forEach((internalDrawing) => {
                    let insertedPencil = this._internalPencil.parseFromJson(internalDrawing as Konva.Shape);
                    if (!insertedPencil) {
                        return;
                    }
                    placeholder.add(insertedPencil);
                });
                this.registerMovingEvent(placeholder);
                res();
            });
        });
    }

    extractId(stickyNote: Group) {
        return stickyNote.name().split(" ").find(x => x !== StickyNoteCommands.StickyNoteName) ?? "";
    }

    getStickyNoteById(stickyNoteId: string) {
        return this._allPastedStickyNotes()
            .find(x => x.hasName(stickyNoteId))!;
    }

    registerMovingEvent(placeholder: Group) {
        placeholder.on('dragend', (e) => {
            this._justMovedStickyNote.next(this.extractId(placeholder));
        });
    }

    public attachStickyNotePlaceholder(): Promise<void> {
        const stickyNoteImageUrl = `/assets/stickynotes/${Math.ceil(Math.random() * 12).toString().padStart(2, "0")}.png`;
        return new Promise<void>((res, rej) => {
            Konva.Image.fromURL(stickyNoteImageUrl, (image) => {
                var placeholder = this._adjustImage(image);
                this._stickyNotePlaceHolderName.forEach(n => placeholder.addName(n));
                this._foundation.add(placeholder);
                res();
            });
        });
    }

    setDraggable(value: boolean) {
        this._allPastedStickyNotes()
            .forEach((stickyNote) => {
                stickyNote.draggable(value);
            });
    }

    private _isIntersect(shape: Shape<ShapeConfig>, stickyNote: Konva.Group): boolean {
        const rect1 = shape.getClientRect();
        const rect2 = this._extractBackground(stickyNote).getClientRect();
        
        return areRectanglesIntersecting(rect1, rect2);
    }

    private _draggableImage(newKonvaObject: Konva.Group) {
        newKonvaObject.draggable(true);
    }

    private _adjustImage(image: Konva.Image) {
        const placeholder = new Konva.Group();
        placeholder.setAttr(StickyNoteCommands.BackgroundUrlAttrName, image.attrs.image.currentSrc);
        const stickyNoteRatio = image.width() / image.height();
        image.addName(StickyNoteCommands.StickyNoteBackgroundName);
        image.width(this._standardStickyNoteSize);
        image.height(this._standardStickyNoteSize / stickyNoteRatio);
        placeholder.add(image);
        
        return placeholder;
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

    private _allPastedStickyNotes() {
        return this._drawingLayer.children.filter((o) => {
            return o instanceof Konva.Group && o.hasName(StickyNoteCommands.StickyNoteName) && !o.hasName(this._placeholderName);
        })
        .map(s => s as Konva.Group);
    }
}