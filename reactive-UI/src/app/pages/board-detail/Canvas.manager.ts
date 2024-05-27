import Konva from 'konva';
import { PRIMARY_COLOR } from '../../configs/theme.constants';
import { BackgroundLayerManager } from './BackgroundLayer.manager';

export class CanvasManager {
    private _viewPort: Konva.Stage;
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _background: BackgroundLayerManager;

    constructor(stage: Konva.Stage) {
        this._viewPort = stage;
        this._background = new BackgroundLayerManager(this._viewPort);

        this._viewPort.on('dragstart', () => {
            document.body.style.cursor = 'grab';
        });

        this._viewPort.on('dragend', () => {
            document.body.style.cursor = 'default';
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