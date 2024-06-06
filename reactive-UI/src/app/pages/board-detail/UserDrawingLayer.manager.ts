import Konva from "konva";
import { PRIMARY_COLOR } from "../../configs/theme.constants";

export class UserDrawingLayerManager {
    private _drawingLayer: Konva.Layer;
    private _theme =  {
        primary: PRIMARY_COLOR
    }

    constructor(private _viewPort: Konva.Stage) {
        this._drawingLayer = new Konva.Layer();
        this._viewPort.add(this._drawingLayer);
    }
}