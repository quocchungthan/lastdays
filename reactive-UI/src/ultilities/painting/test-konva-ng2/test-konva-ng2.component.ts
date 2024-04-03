import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  DashedPath,
  DrawingBearer,
  ShapeCircle,
  ShapeEllipse,
  ShapeLineArrow,
  ShapeRect,
  SolidPath,
} from '../communication-objects/DrawingObject.fabric';
import Konva from 'konva';
import { Subject, debounceTime } from 'rxjs';
import { Stage } from 'konva/lib/Stage';
import { drawingJSON } from '../data-to-migrate';

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

const GAP_BETWEEN_ACCEPTED_TRIGGERS = 200;
const DEFAULT_SCALE = 100;
type ZoomLimit = Range<1, 600>;
type Position = {
  x: number;
  y: number;
};

@Component({
  selector: 'test-konva-ng2',
  standalone: true,
  imports: [],
  templateUrl: './test-konva-ng2.component.html',
  styleUrl: './test-konva-ng2.component.scss',
})
export class TestKonvaNg2Component implements OnChanges, AfterViewInit, OnInit {
  @Input()
  data: DrawingBearer = drawingJSON;

  zoomLevel: ZoomLimit = DEFAULT_SCALE;
  zoomFocusPosition: Position = { x: 0, y: 0 };
  justZoomEvents = new Subject<boolean>();
  reRenderRequests = new Subject<boolean>();

  private _stage?: Stage;

  constructor() {
    this._zoomAndDataChangeFireRerenderEvent();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._setupZoomController();
    this.reRenderRequests.next(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const sourceToRenderChanged = changes['data']?.currentValue;
    if (sourceToRenderChanged) {
      console.log('Start drawing');
      this.reRenderRequests.next(true);
    }
  }

  handleZooming($event: Event) {
    console.log($event);
  }

  handleInput($event: Event) {
    console.log($event);
  }

  private _zoomAndDataChangeFireRerenderEvent() {
    console.log('setup');
    this.reRenderRequests
      // .pipe(debounceTime(GAP_BETWEEN_ACCEPTED_TRIGGERS))
      .subscribe(() => {
        this._mapFabricToKonva();
      });

    this.justZoomEvents.subscribe(() => {
      if (!this._stage) {
        return;
      }

      this._rePositionCanvas(this._stage);
      // this.reRenderRequests.next(true);
    });
  }

  private _setupZoomController() {
    const self = this;
    const slider = document.getElementById(
      'zoomLevelController'
    ) as HTMLInputElement;
    if (!slider) {
      return;
    }
    slider.addEventListener('wheel', function (e) {
      if (e.deltaY < 0) {
        slider.valueAsNumber += 4;
      } else {
        slider.valueAsNumber -= 4;
      }
      self.zoomFocusPosition = {
        x: 400,
        y: 400
      }
      self.zoomLevel = slider.valueAsNumber as ZoomLimit;

      e.preventDefault();
      e.stopPropagation();
      self.justZoomEvents.next(true);
    });
  }
  /**
   * TODO: if this fire the current mouse position   
   *  document
      .getElementsByClassName('iv-image-view')[0]
      .addEventListener('zoomChanged', (o: any) => {
        console.log(o);
        return this.onZoomChanged(o.detail.newZoomValue);
      }
      );
   */

  _mapFabricToKonva() {
    this._stage = new Konva.Stage({
      container: 'konva-container',
      width: this.data.width,
      height: this.data.height,
    });

    var layer = new Konva.Layer();
    this.data.objects.forEach((o) => {
      if (o instanceof ShapeCircle) {
        console.log('I found a circle', o);

        var circle = new Konva.Circle({
          x: o.left,
          y: o.top,
          radius: o.radius,
          fill: o.backgroundColor,
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
        });

        // add the shape to the layer
        layer.add(circle);
      }

      if (o instanceof ShapeEllipse) {
        console.log('I found an ellipse', o);

        var ellipse = new Konva.Ellipse({
          x: o.left,
          y: o.top,
          radiusX: o.rx,
          radiusY: o.ry,
          fill: o.backgroundColor,
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
        });

        // add the shape to the layer
        layer.add(ellipse);
      }

      if (o instanceof ShapeRect) {
        console.log('I found a rect', o);

        var rect = new Konva.Rect({
          x: o.left,
          y: o.top,
          width: o.width,
          height: o.height,
          fill: o.backgroundColor,
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
        });

        // add the shape to the layer
        layer.add(rect);
      }
      // TODO: triangle
      
      if (o instanceof DashedPath) {
        console.log('I found a path', o);

        var solidPath = new Konva.Path({
          x: o.left,
          y: o.top,
          fill: o.backgroundColor,
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
          data: o.path.map(x => x.join(' ')).join(', '),
          dash: o.strokeDashArray
        });

        // add the shape to the layer
        layer.add(solidPath);
      }

      if (o instanceof SolidPath) {
        console.log('I found a path', o);

        var solidPath = new Konva.Path({
          x: o.left,
          y: o.top,
          fill: o.backgroundColor,
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
          data: o.path.map(x => x.join(' ')).join(', '),
        });

        // add the shape to the layer
        layer.add(solidPath);
      }
      // TODO: arrow
      if (o instanceof ShapeLineArrow) {
        console.log('I found a path', o);

        var arrow = new Konva.Arrow({
          x: o.left,
          y: o.top,
          points: [o.x1, o.y1, o.x2, o.y2],
          fill: o.backgroundColor,
          stroke: o.stroke,
          strokeWidth: o.strokeWidth,
        });

        // add the shape to the layer
        layer.add(arrow);
      }
    });

    // add the layer to the stage
    this._stage.add(layer);
    const stage = this._stage!;

    this._stage.on('wheel', (e) => {
        // stop default scrolling
        e.evt.preventDefault();

        var oldScale = stage.scaleX();
        var pointer = stage.getPointerPosition();

        if (pointer === null) {
          console.log('Pointer can\'t be null');
          return;
        }

        var mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;
        if (e.evt.deltaY < 0) {
          this.zoomLevel += 4;
        } else {
          this.zoomLevel -= 4;
        }


        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
          direction = -direction;
        }
        const zoomInPercentage = this.zoomLevel / DEFAULT_SCALE;
        
        stage.scale({ x: zoomInPercentage, y: zoomInPercentage });

        var newPos = {
          x: pointer.x - mousePointTo.x * zoomInPercentage,
          y: pointer.y - mousePointTo.y * zoomInPercentage,
        };
        stage.position(newPos);
      });
  }

  private _rePositionCanvas(stage: Stage) {
    const zoomInPercentage = this.zoomLevel / DEFAULT_SCALE;
    stage.scale({ x: zoomInPercentage, y: zoomInPercentage });
    // var newPos = {
    //   x: this.zoomFocusPosition.x,
    //   y: this.zoomFocusPosition.y,
    // };
    // stage.position(newPos);
  }
}
