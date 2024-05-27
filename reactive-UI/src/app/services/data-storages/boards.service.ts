import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { Board } from './entities/Board';

@Injectable({
  providedIn: 'root'
})
export class BoardsService extends CrudBaseService<Board> {

  constructor() {
    super(Board);
   }
}
