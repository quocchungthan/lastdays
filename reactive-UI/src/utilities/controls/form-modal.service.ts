import { Injectable } from '@angular/core';
import { filter, Subject } from 'rxjs';
import { ModalContentComponent } from './form-modal/IModalContentComponent';
import { isNil } from 'lodash';

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
  private _contentType?: typeof ModalContentComponent;
  private _contentComponent?: ModalContentComponent;

  constructor() { }

  open(contentType: (typeof ModalContentComponent)) {
    this._contentType = contentType;
    this._dialogFeedbacks.next(DialogFeedback.Open);
  }

  storeDialogContentComponent(component: ModalContentComponent) {
    this._contentComponent = component;
  }

  getDialogContentComponent() {
    if (isNil(this._contentComponent)) {
      throw 'This should never happened, the content should be set in FormModalComponent before the command getting this';
    }
    return this._contentComponent;
  }

  getComponentType() {
    if (!this._contentType) {
      throw Error("content type should be set before change the dialog feedbakc value to Open");
    }
    return this._contentType;
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
