import Konva from 'konva';
import { PRIMARY_COLOR } from '../../configs/theme.constants';
import { BackgroundLayerManager } from './BackgroundLayer.manager';
import { IViewPortEventsManager, ViewPortEventsManager } from './ViewPortEvents.manager';
import { CursorManager, ICursorManager } from './Cursor.manager';

export class CanvasManager {
    private _viewPort: Konva.Stage;
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _background: BackgroundLayerManager;
    private _viewPortEvents: IViewPortEventsManager;
    private _cursorManager: ICursorManager;

    constructor(stage: Konva.Stage) {
        this._viewPort = stage;
        this._background = new BackgroundLayerManager(this._viewPort);
        this._viewPortEvents = new ViewPortEventsManager(this._viewPort);
        this._cursorManager = new CursorManager();
        this._viewPortEvents.onDragStart().subscribe(() => {
            this._cursorManager.grabbing();
        });

        this._viewPortEvents.onDragEnd().subscribe(() => {
            this._cursorManager.reset();
            this._background.putTheRuler();
        });
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