import { Injectable } from "@angular/core";
import { ALEvent } from "../../common.definitions/local-entities/ALEvent";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ALEventConstructionService {
   boardCreated() {
      return {
         boardId: uuidv4(),
         id: uuidv4(),
         timestamp: new Date().toISOString(),
         code: 'BoardCreated'
      } as ALEvent;
   }
}