import { v4 as uuidv4 } from 'uuid';
import { IEventGeneral } from "./EventGeneral.interface";

export class BoardCreationEvent implements IEventGeneral {
   timestamp: string | Date = new Date().toUTCString();
   eventId: string = uuidv4();
   boardId: string = uuidv4();
   code: string = 'BoardCreationEvent';
}