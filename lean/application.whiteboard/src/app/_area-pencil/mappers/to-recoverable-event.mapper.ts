import Konva from "konva";
import { PencilUpEvent } from "../../../syncing-models/PencilUpEvent";
import { getBoardId } from "../../../utils/url.helper";
import { STROKE_WIDTH } from "../../../shared-configuration/size";
import { Point } from "../../../share-models/Point";
import { v4 as uuidv4 } from 'uuid';
import { SUPPORTED_COLORS } from "../../../shared-configuration/theme.constants";

export function ToRecoverableEvent(object: Konva.Line): PencilUpEvent {
   const event = new PencilUpEvent();
   object.points().forEach((e, i) => {
      if (i % 2 === 0) {
         event.points.push({x: e, y: 0});
      } else {
         event.points[event.points.length - 1].y = e;
      }
   });
   event.name = object.name();
   event.color = object.stroke();
   event.boardId = getBoardId(location.href) ?? '';

   return event;
}

export function Recover(event: PencilUpEvent): Konva.Line {
   event.color ??= SUPPORTED_COLORS[0];
   event.name ??= 'pencil ' + event.eventId;
   return new Konva.Line({
      name: event.name,
      stroke: event.color,
      strokeWidth: STROKE_WIDTH,
      points: (event.points ?? []).flatMap(x => [x.x, x.y]),
      fill: 'transparent'
   });
}

export function Init(position: Point, color: string) {
   return new Konva.Line({
      fill: 'transparent',
      stroke: color,
      strokeWidth: STROKE_WIDTH,
      points: [position.x, position.y, position.x, position.y],
      name: 'pencil ' + uuidv4()
    })
}