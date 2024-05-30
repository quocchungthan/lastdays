import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';

export interface StickyNote {
    navtive: Konva.Group;
}

export class PencilCommands {
    public static readonly CommandName = "pencil";
    private _currentObject?: Konva.Line;
    private _color = 'black';
    private _size = 4;

    // Inteface common between the commands that matches the Events manager so that's make code much more simple, less switch case.
    public penDown(position: Point) {
        if (this._currentObject) {
            return;
        }

        this._currentObject = new Konva.Line({
            fill: 'transparent',
            stroke: this._color,
            strokeWidth: this._size,
            points: [position.x, position.y, position.x, position.y]
        });
    }

    public penMove(position: Point) {
        if (!this._currentObject) {
            return;
        }

        this._currentObject.points(this._currentObject.points().concat([position.x, position.y]));
    }

    public penUp() {
        const toBeSaved = this._currentObject;
        this._currentObject = undefined;

        return toBeSaved;
    }
}