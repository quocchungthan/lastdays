import { Point } from "../share-models/Point";
import { IEventGeneral } from "./EventGeneral.interface";
import { v4 as uuidv4 } from 'uuid';

export class StickyNotePastedEvent implements IEventGeneral {
   timestamp: string | Date = new Date().toUTCString();
   eventId: string = uuidv4();
   boardId: string = uuidv4();
   code: string = 'StickyNotePastedEvent';
   position: Point = { x: 0, y: 0 };
   color: string | CanvasGradient = '';
   name: string = '';
   rotation = 0;
}