import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DrawingBearer, ShapeCircle, ShapeEllipse, ShapeRect, ShapeTriangle } from '../communication-objects/DrawingObject.fabric';
import Konva from 'konva';

@Component({
  selector: 'test-konva-ng2',
  standalone: true,
  imports: [],
  templateUrl: './test-konva-ng2.component.html',
  styleUrl: './test-konva-ng2.component.scss'
})
export class TestKonvaNg2Component implements OnChanges {
  @Input()
  data: DrawingBearer = {
    version: '1.1.1',
    objects: [],
    height: 0,
    width: 0,
  };

  ngOnChanges(changes: SimpleChanges): void {
    const sourceToRenderChanged = changes['data']?.currentValue;
    if (sourceToRenderChanged) {
      this._mapFabricToKonva(sourceToRenderChanged);
    }
  }

  _mapFabricToKonva(sourceToRenderChanged: DrawingBearer) {
    var stage = new Konva.Stage({
      container: 'konva-container',
      width: sourceToRenderChanged.width,
      height: sourceToRenderChanged.height,
    });

    var layer = new Konva.Layer();
    sourceToRenderChanged.objects.forEach(o => {
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
          strokeWidth: o.strokeWidth
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
          strokeWidth: o.strokeWidth
        });
    
        // add the shape to the layer
        layer.add(rect);
      }
      // TODO: triangle
      // TODO: dotted
      // TODO: solid
      // TODO: arrow
    });

    // add the layer to the stage
    stage.add(layer);
  }
}
