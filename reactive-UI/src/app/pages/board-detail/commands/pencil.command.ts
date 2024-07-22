import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';
import { ToolCompositionService } from '../../../services/states/tool-composition.service';
import { STROKE_WIDTH } from '../../../configs/size';
import { PencilUpEvent } from '../../../events/drawings/EventQueue';

export class PencilCommands {
    public static readonly CommandName = "pencil";
    public static readonly IconPng = 'pencil.png';
    public static PENCIL_NAME = "SIMPLE_INK";
    private _currentObject?: Konva.Line;
    private _size = STROKE_WIDTH;

    /**
     *
     */
    constructor(private _layer: Konva.Layer, private _toolComposition: ToolCompositionService) {
    }

    extractId(stickyNote: Konva.Line) {
        return stickyNote.name().split(" ").find(x => x !== "") ?? "";
    }

    clearAll() {
        // TODO: this remove the sticky notes and other components as well, consider to move this to more general place
        // TODO: maybe Eraser
        this._layer.removeChildren();
    }

    // Inteface common between the commands that matches the Events manager so that's make code much more simple, less switch case.
    public penDown(position: Point) {
        if (this._currentObject) {
            return;
        }

        this._currentObject = new Konva.Line({
            fill: 'transparent',
            stroke: this._toolComposition.color,
            strokeWidth: this._size,
            points: [position.x, position.y, position.x, position.y]
        });
        this._layer.add(this._currentObject);
    }

    public penMove(position: Point) {
        if (!this._currentObject) {
            return;
        }

        this._currentObject.points(this._currentObject.points().concat([position.x, position.y]));
    }

    public penUp() {
        const toBeSaved = this._currentObject;
        this._currentObject?.destroy();
        this._currentObject = undefined;

        return toBeSaved;
    }

    public parseFromJson(shape: Konva.Shape) {
        if (shape?.className !== 'Line') {
            return undefined;
        }

        const instantObject = new Konva.Line({
            fill: 'transparent',
            stroke: shape.attrs.stroke,
            name: shape.attrs.name,
            strokeWidth: shape.attrs.strokeWidth,
            points: shape.attrs.points
        });
        this._layer.add(instantObject);

        return instantObject;
    }

    getInkById(id: string) {
        return this._layer.children.filter((o) => {
                return o instanceof Konva.Line && o.hasName(PencilCommands.PENCIL_NAME);
            })
            .map(s => s as Konva.Line)
            .find(x => x.hasName(id))!;
    }

    public parseFromEvent(event: PencilUpEvent) {
        const instantObject = new Konva.Line({
            fill: 'transparent',
            stroke: event.color,
            name: `${PencilCommands.PENCIL_NAME} ${event.targetId}`,
            strokeWidth: event.width,
            points: event.points
        });
        this._layer.add(instantObject);
    }
}