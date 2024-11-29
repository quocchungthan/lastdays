import { Point } from "../dimention-models/Point";
import { IEventGeneral } from "./EventGeneral.interface";
import { v4 as uuidv4 } from 'uuid';

export class ArrowPastedEvent implements IEventGeneral {
   timestamp: string | Date = new Date().toUTCString();
   eventId: string = uuidv4();
   boardId: string = uuidv4();
   code: string = 'ArrowPastedEvent';
   start: Point = { x: 0, y: 0 };
   end: Point = { x: 0, y: 0 };
   color: string | CanvasGradient = '';
   name: string = '';
}