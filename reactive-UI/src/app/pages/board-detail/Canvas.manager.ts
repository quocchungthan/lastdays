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
    }

    drawBackground() {
      this._background.putTheRuler();
    }
}