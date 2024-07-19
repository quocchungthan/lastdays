import { Injectable } from '@angular/core';
import { SavedBoard } from './entities/SavedBoard';
import { CrudBaseService } from './crudbase.service';
import { BoardsService } from './boards.service';
import { Board } from './entities/Board';

@Injectable({
  providedIn: 'root'
})
export class SavedBoardsService extends CrudBaseService<SavedBoard> {

  constructor(private _boards: BoardsService) { 
    super(SavedBoard);
  }

  public async getSavedBoards(): Promise<Board[]> {
    var savedBoards = (await this.index()).map(x => x.boardId);
    return (await this._boards.index())
      .filter(x => savedBoards.includes(x.id));
  }
}
