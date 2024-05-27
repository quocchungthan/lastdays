import Konva from 'konva';
import { Point } from '../../../ultilities/types/Point';
import { PRIMARY_COLOR } from '../../configs/theme.constants';

export class BackgroundLayerManager {
    private _backgroundLayer: Konva.Layer;
    private _theme =  {
        primary: PRIMARY_COLOR
    }

    private readonly _verticalLineName = 'verticalLine';

    private readonly _horizontalLineName = 'horizontalLine';

    private readonly _rulersGroupName = 'rulersGroup';

    private readonly _rulerSize = 1;

    constructor(private _viewPort: Konva.Stage) {
        this._backgroundLayer = new Konva.Layer();
        this._viewPort.add(this._backgroundLayer);
    }

    public putTheRuler() {
        const centerTop: Point = {
            x: this._viewPort.width() / 2,
            y: 0
        };

        const centerBottom: Point = {
            x: this._viewPort.width() / 2,
            y: this._viewPort.height()
        };

        const middleLeft: Point = {
            x: 0,
            y: this._viewPort.height() / 2
        };

        const middleBottom: Point = {
            x: this._viewPort.width(),
            y: this._viewPort.height() / 2
        };

        const verticalLine = new Konva.Line({
            points: [centerTop.x, centerTop.y, centerBottom.x, centerBottom.y],
            stroke: this._theme.primary,
            // Which never change
            strokeWidth: this._rulerSize,
            fill: 'transparent',
            name: this._verticalLineName
        });

        const horizontalLine = new Konva.Line({
            points: [middleLeft.x, middleLeft.y, middleBottom.x, middleBottom.y],
            stroke: this._theme.primary,
            // Which never change
            strokeWidth: this._rulerSize,
            fill: 'transparent',
            name: this._horizontalLineName
        });

        const rulersGroup = new Konva.Group({
            name: this._rulersGroupName
        });
        rulersGroup.add(verticalLine);
        rulersGroup.add(horizontalLine);

        this._backgroundLayer.add(rulersGroup);
    }
}