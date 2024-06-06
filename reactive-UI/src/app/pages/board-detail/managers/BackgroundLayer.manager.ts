import Konva from 'konva';
import { Point } from '../../../../ultilities/types/Point';
import { PRIMARY_COLOR } from '../../../configs/theme.constants';
import { LineConfig } from 'konva/lib/shapes/Line';
import { KonvaObjectService } from '../../../services/3rds/konva-object.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BackgroundLayerManager {
    private _backgroundLayer!: Konva.Layer;
    private _viewPort!: Konva.Stage;
    private _theme =  {
        primary: PRIMARY_COLOR
    }

    private readonly _verticalLineName = 'verticalLine';

    private readonly _horizontalLineName = 'horizontalLine';

    private readonly _rulersGroupName = 'rulersGroup';

    private readonly _rulerSize = 1;
    private readonly _rulerStep = 50;

    private readonly _rulerDashSize = 3;
    _centerTop: Point = { x: 0, y: 0 };
    _centerBottom: Point = { x: 0, y: 0 };
    _middleLeft: Point = { x: 0, y: 0 };
    _middleRight: Point = { x: 0, y: 0 };
    constructor(_konvaObjects: KonvaObjectService) {
        _konvaObjects.viewPortChanges.subscribe((s) => {
            this._backgroundLayer = new Konva.Layer();
            s.add(this._backgroundLayer);
            this._viewPort = s;
        });
    }

    get rulersGroup () {
        return this._backgroundLayer.children.find(x => x.name() === this._rulersGroupName) as Konva.Group;
    }

    get primaryLineDefaultConfig() {
        return {
            points: [],
            stroke: this._theme.primary,
            // Which never change
            strokeWidth: this._rulerSize,
            fill: 'transparent'
        } as LineConfig
    }

    public putTheRuler() {
        this._backgroundLayer.removeChildren();
        this.rulersGroup?.removeChildren();
        this._centerTop = {
            x: 0,
            y: - this._viewPort.y()
        };

        this._centerBottom = {
            x: 0,
            y: this._viewPort.height() - this._viewPort.y()
        };

        this._middleLeft = {
            x: - this._viewPort.x(),
            y: 0
        };

        this._middleRight = {
            x: this._viewPort.width() - this._viewPort.x(),
            y: 0
        };

        const verticalLine = new Konva.Line({
            ...this.primaryLineDefaultConfig,
            points: [this._centerTop.x, this._centerTop.y, this._centerBottom.x, this._centerBottom.y],
            name: this._verticalLineName

        });

        const horizontalLine = new Konva.Line({
            ...this.primaryLineDefaultConfig,
            points: [this._middleLeft.x, this._middleLeft.y, this._middleRight.x, this._middleRight.y],
            name: this._horizontalLineName
        });

        const rulersGroup = new Konva.Group({
            name: this._rulersGroupName
        });
        rulersGroup.add(verticalLine);
        rulersGroup.add(horizontalLine);

        this._backgroundLayer.add(rulersGroup);

        this._drawTheSteps();
    }

    private _drawTheSteps() {
        let iterator = 0;
        do {
            ++ iterator;
            this._drawSmallDashOnVerticalRuler(iterator, 1);
            this._drawSmallDashOnVerticalRuler(iterator, -1);
        } while (- iterator * this._rulerStep > this._centerTop.y || iterator * this._rulerStep < this._centerBottom.y);

        iterator = 0;
        do {
            ++ iterator;
            this._drawSmallDashOnHorizontalRuler(iterator, 1);
            this._drawSmallDashOnHorizontalRuler(iterator, -1);
        } while (- iterator * this._rulerStep >  this._middleLeft.x || iterator * this._rulerStep <  this._middleRight.x);
    }

    private _drawSmallDashOnVerticalRuler(iterator: number, direction: number) {
        const rulerStepDash = new Konva.Line({
            ...this.primaryLineDefaultConfig,
            points: [- this._rulerDashSize, direction * iterator * this._rulerStep, this._rulerDashSize, direction * iterator * this._rulerStep]
        });
        this.rulersGroup.add(rulerStepDash);
    }

    private _drawSmallDashOnHorizontalRuler(iterator: number, direction: number) {
        const rulerStepDash = new Konva.Line({
            ...this.primaryLineDefaultConfig,
            points: [direction * iterator * this._rulerStep, - this._rulerDashSize, direction * iterator * this._rulerStep, this._rulerDashSize]
        });
        this.rulersGroup.add(rulerStepDash);
    }
}