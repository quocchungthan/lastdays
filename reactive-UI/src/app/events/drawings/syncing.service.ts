import { Injectable } from '@angular/core';
import { BaseEvent } from './EventQueue';

@Injectable({
  providedIn: 'root'
})
export class SyncingService {

  constructor() { }

  public trySendEvent(event: BaseEvent) {

  }

  public onEventAdded(boardId: string) {

  }
}
