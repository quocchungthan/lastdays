import { Injectable } from '@angular/core';
import { BrowserService } from '../services/browser.service';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { webSocket } from 'rxjs/internal/observable/dom/webSocket';
import { tap } from 'rxjs/internal/operators/tap';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { catchError } from 'rxjs/internal/operators/catchError';
import { BehaviorSubject } from 'rxjs';


// TODO: replicated from helper.assistant
export enum WSEventType {
  DRAWING_EVENT = 'DRAWING_EVENT',
  CHAT = 'CHAT_MESSAGE',
  ASK_OTHER_CLIENTS = 'ASK_OTHER_CLIENTS',
  SAY_HELLO = 'SAY_HELLO',
  PARTICIPANTS_COUNT_UPDATE = 'PARTICIPANTS_COUNT_UPDATE',
  OTHER_CLIENT_RESPONDED = 'OTHER_CLIENT_RESPONDED',
}

export interface SayHelloEventData {
  // TODO: use the common package
  user: any;
}

export interface ChatTextEventData {
  text: string;
  displayName: string;
}

export interface WSEvent {
  type: WSEventType;
  // TODO: use the common package
  data: any;
}
// END TODO
@Injectable({
  providedIn: 'root',
})
export class SyncingService {
  private _ws?: WebSocketSubject<WSEvent>;
  private _onlineStatusChanged = new BehaviorSubject<number>(0);

  constructor(private _browserService: BrowserService) {}

  storeEventAsync(event: IEventGeneral) {
    return this._browserService.storeEventAsync(event);
  }

  public listen(boardId: string) {
    const self = this;
    if (this._ws) {
      return this;
    }
    this._ws = webSocket({
      url: 'ws://localhost:4014' + '/ws?board=' + boardId,
      closeObserver: {
        next() {
          self._onlineStatusChanged.next(0);
        },
      },
      openObserver: {
        next() {
          self._onlineStatusChanged.next(1);
        },
      },
    });
    this._listen();

    return this;
  }

  get participantCount() {
   return this._onlineStatusChanged.asObservable();
 }

  private _onMessageReceive(data: WSEvent) {
    switch (data.type) {
      case WSEventType.CHAT:
      case WSEventType.SAY_HELLO:
      case WSEventType.PARTICIPANTS_COUNT_UPDATE:
        break;
      case WSEventType.DRAWING_EVENT:
        //  this._handleAdded(data.data as BaseEvent);
        break;
      case WSEventType.ASK_OTHER_CLIENTS:
        //  // console.log('responding that', this._allEventsBaseEvent);
        //  this._ws?.next({
        //    type: WSEventType.OTHER_CLIENT_RESPONDED,
        //    // data:  this._allEventsBaseEvent
        //  });
        break;
      case WSEventType.OTHER_CLIENT_RESPONDED:
        //  const comparison = this._eventsCompositionService
        //    .compare((data.data as BaseEvent[]).map(x => ToDrawingEvent(x)!));
        //  this._handleComparisionREsult(comparison, data);
        break;
    }
  }

  private _listen() {
    this._ws
      ?.pipe(
        tap({
          error: (error) => console.log(error),
        }),
        catchError((_) => EMPTY)
      )
      .subscribe(this._onMessageReceive.bind(this));
  }
}
