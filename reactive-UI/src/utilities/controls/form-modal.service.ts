import { Injectable } from '@angular/core';
import { filter, Subject } from 'rxjs';

export enum DialogFeedback {
  None,
  Ok,
  Cancel,
  Open
}

@Injectable({
  providedIn: 'root'
})
export class FormModalService {
  private _dialogFeedbacks = new Subject<DialogFeedback>();

  constructor() { }

  open() {
    this._dialogFeedbacks.next(DialogFeedback.Open);
  }

  discard() {
    this._dialogFeedbacks.next(DialogFeedback.Cancel);
  }

  submitHitted() {
    this._dialogFeedbacks.next(DialogFeedback.Ok);
  }

  onCancel() {
    return this._dialogFeedbacks.pipe((filter(x => x === DialogFeedback.Cancel)));
  }

  onOk() {
    return this._dialogFeedbacks.pipe((filter(x => x === DialogFeedback.Ok)));
  }

  onOpen() {
    return this._dialogFeedbacks.pipe((filter(x => x === DialogFeedback.Open)));
  }
}
