import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrlExtractorService {
  private _boardId = new BehaviorSubject<string>('');

  setBoardId(boardId: string) {
    this._boardId.next(boardId);
  }
  
  constructor(private _activatedRoute: ActivatedRoute) { }

  currentBoardIdChanges() {
    return this._boardId.asObservable();
  }
}
