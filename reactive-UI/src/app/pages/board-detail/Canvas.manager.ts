import Konva from 'konva';
import { PRIMARY_COLOR } from '../../configs/theme.constants';
import { BackgroundLayerManager } from './BackgroundLayer.manager';
import { IViewPortEventsManager, ViewPortEventsManager } from './ViewPortEvents.manager';
import { CursorManager, ICursorManager } from './Cursor.manager';
import { UserDrawingLayerManager } from './UserDrawingLayer.manager';
import { StickyNoteCommands } from './commands/sticky-notes.command';
import { PencilCommands } from './commands/pencil.command';

export class CanvasManager {
    private _viewPort: Konva.Stage;
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _background: BackgroundLayerManager;
    private _userDrawing: UserDrawingLayerManager;
    private _viewPortEvents: IViewPortEventsManager;
    private _cursorManager: ICursorManager;
    private _tool: string = '';

    constructor(stage: Konva.Stage) {
        this._viewPort = stage;
        this._background = new BackgroundLayerManager(this._viewPort);
        this._viewPortEvents = new ViewPortEventsManager(this._viewPort);
        this._userDrawing = new UserDrawingLayerManager(this._viewPort, this._viewPortEvents);
        this._cursorManager = new CursorManager();
        this._viewPortEvents.onDragStart().subscribe(() => {
            this._cursorManager.grabbing();
        });

        this._viewPortEvents.onDragEnd().subscribe(() => {
            this._background.putTheRuler();
        });

        this._viewPortEvents.onTouchEnd().subscribe(() => {
            if (!this._tool) {
                this._cursorManager.reset();
            }
        });
    }

    public setTool(tool: string) {
        this._tool = tool;
        this._userDrawing.setTool(tool);
        // TODO: if Tool everywhere, need an interface, and put implementations 
        // that has the same condition in one class which is instance of that interface.
        if (!this._tool) {
            this._cursorManager.reset();
            this._viewPort.draggable(true);

            return;
        }

        this._viewPort.draggable(false);

        if (this._tool == StickyNoteCommands.CommandName) {
            this._cursorManager.reset();
        }

        if (this._tool == PencilCommands.CommandName) {
            this._cursorManager.pencil();
        }
    }

    public originateTopLeftCorner () {
        this._viewPort.position({
            x: this._viewPort.width() / 2,
            y: this._viewPort.height() / 2,
        });
    }

    drawBackground() {
      this.originateTopLeftCorner();
      this._background.putTheRuler();
    }
}