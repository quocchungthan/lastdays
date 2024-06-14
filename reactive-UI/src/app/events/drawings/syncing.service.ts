import { Injectable } from '@angular/core';
import { BaseEvent } from './EventQueue';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { WEB_SOCKET_SERVER } from '../../configs/routing.consants';
import { EMPTY, catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncingService {
  private _ws: WebSocketSubject<any>;

  constructor() {
    this._ws = webSocket(WEB_SOCKET_SERVER);
    this._listen();
  }

  public trySendEvent(event: BaseEvent) {
    console.log('try sending event', event);
  }

  public onEventAdded(boardId: string) {
    console.log('got subscription');
  }

  private _onMessageReceive(data: any) {
    console.log('received', data);
  }

  private _listen() {
    this._ws.pipe(
      tap({
        error: error => console.log(error),
      }), catchError(_ => EMPTY))
      .subscribe(this._onMessageReceive.bind(this));
  }
}
