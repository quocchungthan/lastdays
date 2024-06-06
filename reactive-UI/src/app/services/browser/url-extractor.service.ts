import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlExtractorService {
  private _boardId: string = '';

  setBoardId(boardId: string) {
    this._boardId = boardId;
  }
  
  constructor(private _activatedRoute: ActivatedRoute) { }

  currentBoardIdChanges() {
    return of(this._boardId);
  }
}
