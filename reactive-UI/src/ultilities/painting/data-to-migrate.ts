import {
    DashedPath,
  DrawingBearer,
  ShapeCircle,
  ShapeEllipse,
  ShapeLineArrow,
  ShapeRect,
  ShapeTriangle,
  SolidPath,
} from './communication-objects/DrawingObject.fabric';

const sampleCircle: ShapeCircle = new ShapeCircle();
const sampleEllipse: ShapeEllipse = new ShapeEllipse();
const sampleArrow: ShapeLineArrow = new ShapeLineArrow();
const sampleTriangle: ShapeTriangle = new ShapeTriangle();
const sampleRect: ShapeRect = new ShapeRect();
const sampleDotted: DashedPath = new DashedPath();
const sampleFreeLine: SolidPath = new SolidPath();

sampleFreeLine.type = 'path';
sampleFreeLine.version = '2.4.6';
sampleFreeLine.originX = 'left';
sampleFreeLine.originY = 'top';
sampleFreeLine.left = 443.49699999999996;
sampleFreeLine.top = 178.5;
sampleFreeLine.width = 423.00600000000003;
sampleFreeLine.height = 10;
sampleFreeLine.fill = null;
sampleFreeLine.stroke = 'black';
sampleFreeLine.strokeWidth = 3;
sampleFreeLine.strokeDashArray = null;
sampleFreeLine.strokeLineCap = 'round';
sampleFreeLine.strokeDashOffset = 0;
sampleFreeLine.strokeLineJoin = 'round';
sampleFreeLine.strokeMiterLimit = 10;
sampleFreeLine.scaleX = 1;
sampleFreeLine.scaleY = 1;
sampleFreeLine.angle = 0;
sampleFreeLine.flipX = false;
sampleFreeLine.flipY = false;
sampleFreeLine.opacity = 1;
sampleFreeLine.shadow = null;
sampleFreeLine.visible = true;
sampleFreeLine.clipTo = null;
sampleFreeLine.backgroundColor = '';
sampleFreeLine.fillRule = 'nonzero';
sampleFreeLine.paintFirst = 'fill';
sampleFreeLine.globalCompositeOperation = 'source-over';
sampleFreeLine.transformMatrix = null;
sampleFreeLine.skewX = 0;
sampleFreeLine.skewY = 0;
sampleFreeLine.path = [
        ['M', 444.997, 180],
        ['Q', 445, 180, 447.5, 180],
        ['Q', 450, 180, 456.5, 180],
        ['Q', 463, 180, 490.5, 180],
        ['Q', 518, 180, 540.5, 181],
        ['Q', 563, 182, 591.5, 182],
        ['Q', 620, 182, 650.5, 183.5],
        ['Q', 681, 185, 712.5, 186],
        ['Q', 744, 187, 770, 187.5],
        ['Q', 796, 188, 813, 188.5],
        ['Q', 830, 189, 841.5, 189],
        ['Q', 853, 189, 859.5, 189.5],
        ['Q', 866, 190, 866.5, 190],
        ['Q', 867, 190, 867.5, 190],
        ['L', 868.003, 190],
      ];

sampleDotted.type = 'path';
sampleDotted.version = '2.4.6';
sampleDotted.originX = 'left';
sampleDotted.originY = 'top';
sampleDotted.left = 433.49699999999996;
sampleDotted.top = 266.5;
sampleDotted.width = 480.00600000000003;
sampleDotted.height = 14;
sampleDotted.fill = null;
sampleDotted.stroke = 'black';
sampleDotted.strokeWidth = 3;
sampleDotted.strokeDashArray = [2, 10],
sampleDotted.strokeLineCap = 'round';
sampleDotted.strokeDashOffset = 0;
sampleDotted.strokeLineJoin = 'round';
sampleDotted.strokeMiterLimit = 10;
sampleDotted.scaleX = 1;
sampleDotted.scaleY = 1;
sampleDotted.angle = 0;
sampleDotted.flipX = false;
sampleDotted.flipY = false;
sampleDotted.opacity = 1;
sampleDotted.shadow = null;
sampleDotted.visible = true;
sampleDotted.clipTo = null;
sampleDotted.backgroundColor = '';
sampleDotted.fillRule = 'nonzero';
sampleDotted.paintFirst = 'fill';
sampleDotted.globalCompositeOperation = 'source-over';
sampleDotted.transformMatrix = null;
sampleDotted.skewX = 0;
sampleDotted.skewY = 0;
sampleDotted.path = [
        ['M', 434.997, 268],
        ['Q', 435, 268, 436, 268],
        ['Q', 437, 268, 440.5, 268.5],
        ['Q', 444, 269, 451.5, 270.5],
        ['Q', 459, 272, 468, 273.5],
        ['Q', 477, 275, 488, 276],
        ['Q', 499, 277, 517, 277.5],
        ['Q', 535, 278, 553, 278],
        ['Q', 571, 278, 604, 278],
        ['Q', 637, 278, 661.5, 279],
        ['Q', 686, 280, 710.5, 280],
        ['Q', 735, 280, 761.5, 280.5],
        ['Q', 788, 281, 811.5, 281.5],
        ['Q', 835, 282, 852, 282],
        ['Q', 869, 282, 880, 282],
        ['Q', 891, 282, 897, 282],
        ['Q', 903, 282, 907.5, 282],
        ['Q', 912, 282, 913, 282],
        ['Q', 914, 282, 914.5, 282],
        ['L', 915.003, 282],
      ];

sampleRect.type = 'rect';
sampleRect.version = '2.4.6';
sampleRect.originX = 'left';
sampleRect.originY = 'top';
sampleRect.left = 432;
sampleRect.top = 799;
sampleRect.width = 283;
sampleRect.height = 70;
sampleRect.fill = 'transparent';
sampleRect.stroke = 'black';
sampleRect.strokeWidth = 3;
sampleRect.strokeDashArray = null;
sampleRect.strokeLineCap = 'butt';
sampleRect.strokeDashOffset = 0;
sampleRect.strokeLineJoin = 'miter';
sampleRect.strokeMiterLimit = 4;
sampleRect.scaleX = 1;
sampleRect.scaleY = 1;
sampleRect.angle = 0;
sampleRect.flipX = false;
sampleRect.flipY = false;
sampleRect.opacity = 1;
sampleRect.shadow = null;
sampleRect.visible = true;
sampleRect.clipTo = null;
sampleRect.backgroundColor = '';
sampleRect.fillRule = 'nonzero';
sampleRect.paintFirst = 'fill';
sampleRect.globalCompositeOperation = 'source-over';
sampleRect.transformMatrix = null;
sampleRect.skewX = 0;
sampleRect.skewY = 0;
sampleRect.rx = 0;
sampleRect.ry = 0;

sampleTriangle.type = 'triangle';
sampleTriangle.version = '2.4.6';
sampleTriangle.originX = 'left';
sampleTriangle.originY = 'top';
sampleTriangle.left = 489;
sampleTriangle.top = 989;
sampleTriangle.width = 302;
sampleTriangle.height = 74;
sampleTriangle.fill = 'transparent';
sampleTriangle.stroke = 'black';
sampleTriangle.strokeWidth = 3;
sampleTriangle.strokeDashArray = null;
sampleTriangle.strokeLineCap = 'butt';
sampleTriangle.strokeDashOffset = 0;
sampleTriangle.strokeLineJoin = 'miter';
sampleTriangle.strokeMiterLimit = 4;
sampleTriangle.scaleX = 1;
sampleTriangle.scaleY = 1;
sampleTriangle.angle = 0;
sampleTriangle.flipX = false;
sampleTriangle.flipY = false;
sampleTriangle.opacity = 1;
sampleTriangle.shadow = null;
sampleTriangle.visible = true;
sampleTriangle.clipTo = null;
sampleTriangle.backgroundColor = '';
sampleTriangle.fillRule = 'nonzero';
sampleTriangle.paintFirst = 'fill';
sampleTriangle.globalCompositeOperation = 'source-over';
sampleTriangle.transformMatrix = null;
sampleTriangle.skewX = 0;
sampleTriangle.skewY = 0;

sampleArrow.type = 'lineArrow';
sampleArrow.version = '2.4.6';
sampleArrow.originX = 'center';
sampleArrow.originY = 'center';
sampleArrow.left = 599.5;
sampleArrow.top = 1161.5;
sampleArrow.width = 229;
sampleArrow.height = 57;
sampleArrow.fill = 'transparent';
sampleArrow.stroke = 'black';
sampleArrow.strokeWidth = 3;
sampleArrow.strokeDashArray = null;
sampleArrow.strokeLineCap = 'butt';
sampleArrow.strokeDashOffset = 0;
sampleArrow.strokeLineJoin = 'miter';
sampleArrow.strokeMiterLimit = 4;
sampleArrow.scaleX = 1;
sampleArrow.scaleY = 1;
sampleArrow.angle = 0;
sampleArrow.flipX = false;
sampleArrow.flipY = false;
sampleArrow.opacity = 1;
sampleArrow.shadow = null;
sampleArrow.visible = true;
sampleArrow.clipTo = null;
sampleArrow.backgroundColor = '';
sampleArrow.fillRule = 'nonzero';
sampleArrow.paintFirst = 'fill';
sampleArrow.globalCompositeOperation = 'source-over';
sampleArrow.transformMatrix = null;
sampleArrow.skewX = 0;
sampleArrow.skewY = 0;
sampleArrow.x1 = -114.5;
sampleArrow.x2 = 114.5;
sampleArrow.y1 = 28.5;
sampleArrow.y2 = -28.5;

sampleCircle.type = 'circle';
sampleCircle.version = '2.4.6';
sampleCircle.originX = 'left';
sampleCircle.originY = 'top';
sampleCircle.left = 518;
sampleCircle.top = 324;
sampleCircle.width = 204;
sampleCircle.height = 204;
sampleCircle.fill = 'transparent';
sampleCircle.stroke = 'black';
sampleCircle.strokeWidth = 3;
sampleCircle.strokeDashArray = null;
sampleCircle.strokeLineCap = 'butt';
sampleCircle.strokeDashOffset = 0;
sampleCircle.strokeLineJoin = 'miter';
sampleCircle.strokeMiterLimit = 4;
sampleCircle.scaleX = 1;
sampleCircle.scaleY = 1;
sampleCircle.angle = 0;
sampleCircle.flipX = false;
sampleCircle.flipY = false;
sampleCircle.opacity = 1;
sampleCircle.shadow = null;
sampleCircle.visible = true;
sampleCircle.clipTo = null;
sampleCircle.backgroundColor = '';
sampleCircle.fillRule = 'nonzero';
sampleCircle.paintFirst = 'fill';
sampleCircle.globalCompositeOperation = 'source-over';
sampleCircle.transformMatrix = null;
sampleCircle.skewX = 0;
sampleCircle.skewY = 0;
sampleCircle.radius = 102;
sampleCircle.startAngle = 0;
sampleCircle.endAngle = 6.283185307179586;

sampleEllipse.type = 'ellipse';
sampleEllipse.version = '2.4.6';
sampleEllipse.originX = 'left';
sampleEllipse.originY = 'top';
sampleEllipse.left = 492;
sampleEllipse.top = 614;
sampleEllipse.width = 204;
sampleEllipse.height = 76;
sampleEllipse.fill = 'transparent';
sampleEllipse.stroke = 'black';
sampleEllipse.strokeWidth = 3;
sampleEllipse.strokeDashArray = null;
sampleEllipse.strokeLineCap = 'butt';
sampleEllipse.strokeDashOffset = 0;
sampleEllipse.strokeLineJoin = 'miter';
sampleEllipse.strokeMiterLimit = 4;
sampleEllipse.scaleX = 1;
sampleEllipse.scaleY = 1;
sampleEllipse.angle = 0;
sampleEllipse.flipX = false;
sampleEllipse.flipY = false;
sampleEllipse.opacity = 1;
sampleEllipse.shadow = null;
sampleEllipse.visible = true;
sampleEllipse.clipTo = null;
sampleEllipse.backgroundColor = '';
sampleEllipse.fillRule = 'nonzero';
sampleEllipse.paintFirst = 'fill';
sampleEllipse.globalCompositeOperation = 'source-over';
sampleEllipse.transformMatrix = null;
sampleEllipse.skewX = 0;
sampleEllipse.skewY = 0;
sampleEllipse.rx = 102;
sampleEllipse.ry = 38;

export const drawingJSON: DrawingBearer = {
  version: '2.4.6',
  objects: [
    sampleFreeLine,
    sampleDotted,
    sampleCircle,
    sampleEllipse,
    sampleRect,
    sampleTriangle,
    sampleArrow,
  ],
  width: 1440,
  height: 1440,
};
