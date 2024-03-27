type OriginPosition = 'top' | 'left' | 'right' | 'bottom' | 'center';
type StringNumberArray = [string, ...number[]];

class ShapeBase {
    version: string = '';
    originX: OriginPosition = 'left';
    originY: OriginPosition = 'top';
    left: number = 0;
    top: number = 0;
    width: number = 0;
    height: number = 0;
    stroke: string = 'black';
    strokeWidth: number = 3;
    strokeDashOffset: number = 0;
    strokeMiterLimit: number = 10;
    scaleX: number = 1;
    scaleY: number = 1;
    angle: number = 0;
    flipX: boolean = false;
    flipY: boolean = false;
    opacity: number = 1;
    shadow: null = null;
    visible: boolean = true;
    clipTo: null = null;
    backgroundColor: string = "";
    fillRule: string = "nonzero";
    paintFirst: string = "fill";
    globalCompositeOperation: string = "source-over";
    transformMatrix: null = null;
    skewX: number = 0;
    skewY: number = 0;
}

class PathBase extends ShapeBase {
    type = 'path';
    fill: null = null;
    strokeLineCap: string = 'round';
    strokeLineJoin: string = 'round';
    path: StringNumberArray[] = [];
}

export class SolidPath extends PathBase {
    strokeDashArray: null = null;
}

export class DashedPath extends PathBase {
    strokeDashArray: number[] = [2, 10];
}

export class AngledBase extends ShapeBase {
    strokeDashArray: null = null;
    fill: string = 'transparent';
    strokeLineCap: string =  "butt";
    strokeLineJoin: string =  "miter";
}

export class ShapeCircle extends AngledBase {
    type = "circle";
    radius: number = 102;
    startAngle: number = 0;
    endAngle: number = 6.283185307179586;
}

export class ShapeEllipse extends AngledBase {
    type = "ellipse";
    rx: number = 102;
    ry: number = 38;
}

export class ShapeRect extends AngledBase {
    type = "rect";
    rx: number = 0;
    ry: number = 0;
}

export class ShapeTriangle extends AngledBase {
    type = "triangle";
}

export class ShapeLineArrow extends AngledBase {
    type = "lineArrow";
    x1: number = -114.5;
    x2: number = 114.5;
    y1: number = 28.5;
    y2: number = -28.5;
}

export class DrawingBearer {
    width: number = 1440;
    height: number = 1440;
    objects: Array<ShapeLineArrow | ShapeTriangle | ShapeRect | ShapeEllipse | ShapeCircle | SolidPath | DashedPath> = [];
    version: string = '';
}