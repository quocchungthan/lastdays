import { Injectable } from '@angular/core';
import { BaseEvent } from './EventQueue';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { WEB_SOCKET_SERVER } from '../../configs/routing.consants';
import { BehaviorSubject, EMPTY, catchError, tap } from 'rxjs';
import { WSEvent, WSEventType } from '../to-python-server/web-socket-model';

@Injectable({
  providedIn: 'root'
})
export class SyncingService {
  private _ws?: WebSocketSubject<WSEvent>;
  private _allEvents = new BehaviorSubject<BaseEvent[]>([]);

  constructor() {
  }

  public listen(boardId: string) {
    this._ws = webSocket(WEB_SOCKET_SERVER + '/' + boardId);
    this._listen();

    return this;
  }

  public peerCheck(currentEvents: BaseEvent[]) {
    this._allEvents.next(currentEvents);
    this._askOtherClients();
    return this;
  }

  private _askOtherClients() {
    
  }

  public trySendEvent(event: BaseEvent) {
    this._ws?.next({
      data: event,
      type: WSEventType.DRAWING_EVENT
    });
  }

  public onEventAdded() {
    return this._allEvents.asObservable();
  }

  private _onMessageReceive(data: WSEvent) {
    switch (data.type) {
      case WSEventType.DRAWING_EVENT:
        this._allEvents.next([...this._allEvents.value, data.data as BaseEvent]);
        break;
      case WSEventType.ASK_OTHER_CLIENTS:
        this._ws?.next({
          type: WSEventType.OTHER_CLIENT_RESPONDED,
          data: this._allEvents.value
        });
        break;
      case WSEventType.OTHER_CLIENT_RESPONDED:
        // To compare
        break;
      case WSEventType.CHAT:
        // TODO: chat feature is not implemented
        break;
    }
  }

  private _listen() {
    this._ws?.pipe(
      tap({
        error: error => console.log(error),
      }), catchError(_ => EMPTY))
      .subscribe(this._onMessageReceive.bind(this));
  }
}
