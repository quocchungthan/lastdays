import { v4 as uuidv4 } from 'uuid';
import { IEventGeneral } from "./EventGeneral.interface";
import { SUPPORTED_COLORS } from '../constants/theme.constants';
import { Point } from '../dimention-models/Point';

export class PencilUpEvent implements IEventGeneral {
   timestamp: string | Date = new Date().toUTCString();
   eventId: string = uuidv4();
   boardId: string = uuidv4();
   code: string = 'PencilUpEvent';
   color: string | CanvasGradient = SUPPORTED_COLORS[0];
   points: Point[] = [];
   name: string = '';
}