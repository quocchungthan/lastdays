import { Injectable } from '@angular/core';
import { SavedBoard } from './entities/SavedBoard';
import { CrudBaseService } from './crudbase.service';

@Injectable({
  providedIn: 'root'
})
export class SavedBoardsService extends CrudBaseService<SavedBoard> {

  constructor() { 
    super(SavedBoard);
  }
}
