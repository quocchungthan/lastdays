import Konva from 'konva';
import { LineConfig } from 'konva/lib/shapes/Line';
import { Injectable, OnDestroy } from '@angular/core';
import { Point } from '../../../ui-utilities/types/Point';
import { PRIMARY_COLOR } from '../../../configs/theme.constants';
import { KonvaObjectService } from '../services/3rds/konva-object.service';
import { Subject, takeUntil } from 'rxjs';

@Injectable()
export class BackgroundLayerManager implements OnDestroy {
    private unsubscribe$ = new Subject<void>();
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
        _konvaObjects.viewPortChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((s) => {
            if (s.children.some(x => x === this._backgroundLayer)) {
                return;
            }

            this._backgroundLayer = new Konva.Layer();
            s.add(this._backgroundLayer);
            this._viewPort = s;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
      }

    get rulersGroup () {
        return this._backgroundLayer.children.find(x => x.name() === this._rulersGroupName) as Konva.Group;
    }

    get primaryLineDefaultConfig() {
        return {
            points: [],
            stroke: this._theme.primary,
            // Which never change
            strokeWidth: this._rulerSize * this._getScale(),
            fill: 'transparent'
        } as LineConfig
    }

    public putTheRuler() {
        const scale = this._getScale();
        this._backgroundLayer.removeChildren();
        this.rulersGroup?.removeChildren();
        this._centerTop = {
            x: 0,
            y: - this._viewPort.y() * scale
        };

        this._centerBottom = {
            x: 0,
            y: (this._viewPort.height() - this._viewPort.y()) * scale
        };

        this._middleLeft = {
            x: - this._viewPort.x() * scale,
            y: 0
        };

        this._middleRight = {
            x: (this._viewPort.width() - this._viewPort.x()) * scale,
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

    private _getScaledRulerDashSize() {
        return this._rulerDashSize * this._getScale();
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
        const dashSize = this._getScaledRulerDashSize();
        const rulerStepDash = new Konva.Line({
            ...this.primaryLineDefaultConfig,
            points: [- dashSize, direction * iterator * this._rulerStep, dashSize, direction * iterator * this._rulerStep]
        });
        this.rulersGroup.add(rulerStepDash);
    }

    private _drawSmallDashOnHorizontalRuler(iterator: number, direction: number) {
        const dashSize = this._getScaledRulerDashSize();
        const rulerStepDash = new Konva.Line({
            ...this.primaryLineDefaultConfig,
            points: [direction * iterator * this._rulerStep, - dashSize, direction * iterator * this._rulerStep, dashSize]
        });
        this.rulersGroup.add(rulerStepDash);
    }

    private _getScale() {
        return 1 / this._viewPort.scaleX();
    }
}