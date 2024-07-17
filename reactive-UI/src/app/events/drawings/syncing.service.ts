import { Injectable } from '@angular/core';
import { BaseEvent, ToDrawingEvent } from './EventQueue';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { WEB_SOCKET_SERVER } from '../../configs/routing.consants';
import { BehaviorSubject, EMPTY, catchError, tap } from 'rxjs';
import { WSEvent, WSEventType } from '../to-python-server/web-socket-model';
import { ComparisonResult, EventsCompositionService } from './events-composition.service';
import { ConflictResolverService } from './conflict-resolver.service';

@Injectable()
export class SyncingService {
  private _ws?: WebSocketSubject<WSEvent>;
  private _allEvents = new BehaviorSubject<BaseEvent[]>([]);

  constructor(private _eventsCompositionService: EventsCompositionService, private _conflictResolver: ConflictResolverService) {
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
    this._ws?.next({
      type: WSEventType.ASK_OTHER_CLIENTS,
      data: undefined
    });
  }

  public trySendEvent(event: BaseEvent) {
    this._allEvents.next([...this._allEvents.value, event]);
    this._ws?.next({
      data: event,
      type: WSEventType.DRAWING_EVENT
    });
  }

  public onEventAdded() {
    return this._allEvents.asObservable();
  }

  private _onMessageReceive(data: WSEvent) {
    console.log('Receiving ', data);
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
        const comparison = this._eventsCompositionService
          .compare((data.data as BaseEvent[]).map(x => ToDrawingEvent(x)!));
        this._handleComparisionREsult(comparison, data);
        break;
      case WSEventType.CHAT:
        // TODO: chat feature is not implemented
        break;
    }
  }

  private _handleComparisionREsult(comparison: ComparisonResult, data: WSEvent) {
    console.debug(comparison.toString());
    switch (comparison) {
      // TODO: If they're equal -> ignore
      case ComparisonResult.EQUAL:
        return;
      // TODO: If the up coming is more than all -> do render, do save
      case ComparisonResult.ADDED:
        this._allEvents.next([
          ...this._allEvents.value,
          ...(data.data as BaseEvent[]).slice(this._eventsCompositionService.getQueueLength())
        ]);
        return;
      // TODO: If they're conflict at some point -> replace the local storage, build all again with the up coming
      case ComparisonResult.CONFLICT:
        this._allEvents.next(this._conflictResolver.resolve(data.data as BaseEvent[], this._allEvents.value));
        return;
      default:
        throw Error("Not handled", comparison);
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
