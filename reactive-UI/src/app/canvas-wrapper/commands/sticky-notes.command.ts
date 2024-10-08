import Konva from 'konva';
import { isNil } from 'lodash';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { PencilCommands } from './pencil.command';
import { Subject } from 'rxjs';
import { Group } from 'konva/lib/Group';
import { IRect } from 'konva/lib/types';
import { TextInputCommands } from './text-input.command';
import { FormModalService } from '../../../ui-utilities/controls/form-modal.service';
import { areRectanglesIntersecting } from '../../../ui-utilities/mathematicals/collision';
import { Point } from '../../../ui-utilities/types/Point';
import { STANDARD_STICKY_NOTE_SIZE } from '../../../configs/size';
import { InkAttachedToStickyNoteEvent, StickyNoteMovedEvent, StickyNotePastedEvent } from '../../events/drawings/EventQueue';
import { ToolCompositionService } from '../../services/states/tool-composition.service';
import guid from 'guid';
import { Dimension } from '@ui/types/Dimension';

export interface StickyNote {
    navtive: Konva.Group;
}

export class StickyNoteCommands {
    public static readonly CommandName = "stickynote";
    public static readonly IconPng = 'sticky-note.png';
    public static readonly BackgroundUrlAttrName = "stickynoteUrl";
    private readonly _standardStickyNoteSize = STANDARD_STICKY_NOTE_SIZE;
    private readonly _placeholderName = "PLACEHOLDER";
    public static StickyNoteName = "STICKY_NOTE";
    public static StickyNoteBackgroundName = "STICKY_NOTE_BACKGROUND";
    public static StickNoteOffsetToContent = 10;
    public static MAX_STICKYNOTE_VISUAL_COUNT = 12;

    private readonly _stickyNotePlaceHolderName = [StickyNoteCommands.StickyNoteName, this._placeholderName];
    private _internalPencil: PencilCommands;
    private _internalTextInput: TextInputCommands;
    private _justMovedStickyNote = new Subject<string>();
    private static _randomAttempt = 0;

    constructor(
        private _foundation: Konva.Layer, 
        private _drawingLayer: Konva.Layer,
        private _toolComposition: ToolCompositionService,
        private _formModalService: FormModalService) {
        this._internalPencil = new PencilCommands(this._drawingLayer, _toolComposition);
        this._internalTextInput = new TextInputCommands(this._drawingLayer, _toolComposition, _formModalService);
    }

    static buildEvent(brandNewDrawing: Group, boardId: string, targetId?: string) {
        const event = new StickyNotePastedEvent();
        const background = StickyNoteCommands.extractBackground(brandNewDrawing);
        StickyNoteCommands.fillEvent(
            event, boardId, targetId
            , background.attrs.image.currentSrc,
            {
                width: background.width(),
                height: background.height(),
            }
        );
        event.position = brandNewDrawing.position();
        return event;
    }

    static fillEvent(event: StickyNotePastedEvent, boardId: string, targetId?: string, src?: string, dimension?: Dimension) {
        if (!src) {
            src = StickyNoteCommands.getRandomImageUrl();
        }
        if (!dimension) {
            dimension = {
                width: STANDARD_STICKY_NOTE_SIZE,
                height: STANDARD_STICKY_NOTE_SIZE
            }
        }
        event.targetId = targetId ?? guid.create().toString();
        event.boardId = boardId;
        event.backgroundUrl = src;
        event.dimention = dimension;
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
        this._draggableImage(newKonvaObject);
        return newKonvaObject;
    }

    
    attachInkToStickyNote(event: InkAttachedToStickyNoteEvent) {
        const stickyNote = this.getStickyNoteById(event.targetStickyNoteId);
        const attachable = this._internalPencil.getInkById(event.targetId);

        this._doAttach(attachable, stickyNote);
    }

    attachTextToStickyNote(event: InkAttachedToStickyNoteEvent) {
        const stickyNote = this.getStickyNoteById(event.targetStickyNoteId);
        const attachable = this._internalTextInput.getNativeElementById(event.targetId);

        this._doAttach(attachable, stickyNote);
    }

    moveStickyNote(event: StickyNoteMovedEvent) {
        this.getStickyNoteById(event.targetId)
            .position(event.newPosition);
    }

    // TODO: pass id of the pencil drawing, Pencil create guid before return, syncToDb method extract id from native id.
    attachToStickyNoteAsPossible(shape: Shape<ShapeConfig>) {
        const foundStickyNoteAsBackground = this._allPastedStickyNotes().find(stickyNote => {
            return this._isIntersect(shape, stickyNote);
        });

        if (isNil(foundStickyNoteAsBackground)) {
            return false;
        }
        this._doAttach(shape, foundStickyNoteAsBackground);

        return true;
    }

    getFirstCollisionStickyNoteId(shape: Shape<ShapeConfig>) {
        const foundStickyNoteAsBackground = this._allPastedStickyNotes().find(stickyNote => {
            return this._isIntersect(shape, stickyNote);
        });
        if (foundStickyNoteAsBackground) {
            return this.extractId(foundStickyNoteAsBackground);
        }

        return null;
    }

    private _doAttach(shape: Shape<ShapeConfig>, foundStickyNoteAsBackground: Group) {
        if (shape instanceof Konva.Line) {
            const cloned = shape.clone();
            const shapePointsWithinStickyNote = cloned.points();
            for (let i = 0; i < shapePointsWithinStickyNote.length; i += 2) {
                shapePointsWithinStickyNote[i] -= foundStickyNoteAsBackground.x();
                shapePointsWithinStickyNote[i + 1] -= foundStickyNoteAsBackground.y();
            }
            cloned.points(shapePointsWithinStickyNote);
            foundStickyNoteAsBackground.add(cloned);
            shape.destroy();
        }
        
        if (shape instanceof Konva.Text) {
            const cloned = shape.clone();
            cloned.x(shape.x() - foundStickyNoteAsBackground.x());
            cloned.y(shape.y() - foundStickyNoteAsBackground.y());
            foundStickyNoteAsBackground.add(cloned);
            shape.destroy();
        }
    }

    public movePlaceholder(p: Point) {
        const placeholder = this._findCurrentPlaceholder() as Konva.Group;
        if (!placeholder) {
            return;
        }

        if (!placeholder.visible()) {
            return;
        }

        const background = StickyNoteCommands.extractBackground(placeholder);
        // only background has size
        placeholder.position({x: p.x - background.width() / 2, y: p.y - background.height() / 2});
    }

    static extractBackground(placeholder: Konva.Group) {
        return placeholder.children.find(x => x instanceof Konva.Image)!;
    }

    parseFromEvent(event: StickyNotePastedEvent): Promise<void> {
        return new Promise<void>((res, rej) => {
            Konva.Image.fromURL(event.backgroundUrl, (image) => {
                var placeholder = this._adjustImage(image);
                placeholder.x(event.position.x);
                placeholder.y(event.position.y);
                placeholder.addName(StickyNoteCommands.StickyNoteName);
                placeholder.addName(event.targetId);
                this._drawingLayer.add(placeholder);
                // duplicated code
                this.setDraggable(![PencilCommands.CommandName, TextInputCommands.CommandName].includes(this._toolComposition.tool));
                this.registerMovingEvent(placeholder);
                res();
            });
        });
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

    // TODO: accept only id, stickynotes must create id before return.
    registerMovingEvent(placeholder: Group) {
        placeholder.on('dragend', (e) => {
            this._justMovedStickyNote.next(this.extractId(placeholder));
        });
    }

    public attachStickyNotePlaceholder(): Promise<void> {
        const stickyNoteImageUrl = StickyNoteCommands.getRandomImageUrl();
        return new Promise<void>((res, rej) => {
            Konva.Image.fromURL(stickyNoteImageUrl, (image) => {
                var placeholder = this._adjustImage(image);
                this._stickyNotePlaceHolderName.forEach(n => placeholder.addName(n));
                this._foundation.add(placeholder);
                res();
            });
        });
    }

    static getRandomImageUrl() {
        return `/assets/stickynotes/${StickyNoteCommands._getRandomImageIndex().padStart(2, "0")}.png`;
    }

    setDraggable(value: boolean) {
        this._allPastedStickyNotes()
            .forEach((stickyNote) => {
                stickyNote.draggable(value);
            });
    }

    static _getRandomImageIndex() {
        if (StickyNoteCommands._randomAttempt < StickyNoteCommands.MAX_STICKYNOTE_VISUAL_COUNT - 1) {
            return (++ StickyNoteCommands._randomAttempt).toString();
        }
        return Math.ceil(Math.random() * StickyNoteCommands.MAX_STICKYNOTE_VISUAL_COUNT).toString();
    }

    private _isIntersect(shape: Shape<ShapeConfig>, stickyNote: Konva.Group): boolean {
        const rect1 = shape instanceof Konva.Text ? {...shape.getClientRect(), x: shape.x(), y: shape.y()} : shape.getClientRect();
        const bg = StickyNoteCommands.extractBackground(stickyNote);
        const rect2: IRect = {
            x: stickyNote.x(),
            y: stickyNote.y(),
            width: bg.width(),
            height: bg.height(),
        }

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