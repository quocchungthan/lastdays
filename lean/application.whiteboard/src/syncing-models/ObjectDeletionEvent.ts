import { IEventGeneral } from "./EventGeneral.interface";
import { v4 as uuidv4 } from 'uuid';

export class ObjectDeltionEvent implements IEventGeneral {
   timestamp: string | Date = new Date().toUTCString();
   eventId: string = uuidv4();
   boardId: string = uuidv4();
   code: string = 'ObjectDeltionEvent';
   target: string = '';
}