import { Injectable } from "@angular/core";
import { BoardCreationEvent } from "../../syncing-models/BoardCreationEvent";
import { BrowserService } from "../services/browser.service";

@Injectable({
   providedIn: 'root'
})
export class BoardsService {
   constructor(private browserService: BrowserService) {
   }

   async createNewBoardAsync(choosenId?: string): Promise<string> {
      const boardEvent = new BoardCreationEvent();
      if (choosenId) boardEvent.boardId = choosenId;
      await this.browserService.storeEventAsync(boardEvent);
      return boardEvent.boardId;
   }

   async askForExistingBoardAsync(id: string) {
      const events = await this.browserService.loadAllEventRelatedToBoardAsync(id);
      if (!events.length) {
         id = await this.createNewBoardAsync(id);
      }

      // TODO: Then ask other peers
      // TODO: then resolve conflict
      // TODO: Then update local db
      // TODO: Then sync to that peer
      return (await this.browserService.loadAllEventRelatedToBoardAsync(id))
         .map((x) => {
            x.timestamp = new Date(x.timestamp);
            return x;
         })
         .sort((a, b) => (a.timestamp as Date).getTime() - (a.timestamp as Date).getTime());
   }
}