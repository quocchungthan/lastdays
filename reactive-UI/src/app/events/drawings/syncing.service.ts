import { Injectable } from '@angular/core';
import { BaseEvent } from './EventQueue';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { WEB_SOCKET_SERVER } from '../../configs/routing.consants';
import { EMPTY, catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncingService {
  private _ws?: WebSocketSubject<BaseEvent>;

  constructor() {
  }

  public listen(boardId: string) {
    this._ws = webSocket(WEB_SOCKET_SERVER + '/' + boardId);
    this._listen();

    return this;
  }

  public trySendEvent(event: BaseEvent) {
    this._ws?.next(event);
  }

  public onEventAdded(boardId: string) {
    console.log('got subscription');
  }

  private _onMessageReceive(data: any) {
    console.log('received', data);
  }

  private _listen() {
    this._ws?.pipe(
      tap({
        error: error => console.log(error),
      }), catchError(_ => EMPTY))
      .subscribe(this._onMessageReceive.bind(this));
  }
}
