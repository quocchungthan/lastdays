import Konva from 'konva';

export class BoardItemsManager {
    private _boardItemsLayer: Konva.Layer;

    constructor(private _viewPort: Konva.Stage) {
        this._boardItemsLayer = new Konva.Layer();
        this._viewPort.add(this._boardItemsLayer);
    }
}