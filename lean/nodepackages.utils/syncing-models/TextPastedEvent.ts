import { v4 as uuidv4 } from 'uuid';
import { IEventGeneral } from "./EventGeneral.interface";
import { SUPPORTED_COLORS } from '../constants/theme.constants';
import { Point } from '../dimention-models/Point';

export class TextPastedEvent implements IEventGeneral {
   timestamp: string | Date = new Date().toUTCString();
   eventId: string = uuidv4();
   boardId: string = uuidv4();
   code: string = 'TextPastedEvent';
   color: string | CanvasGradient = SUPPORTED_COLORS[0];
   name: string = '';
   text: string = '';
   rotation: number = 0;
   position: Point = { x: 0, y: 0 };
   fontSize: number = 18;
 }
 