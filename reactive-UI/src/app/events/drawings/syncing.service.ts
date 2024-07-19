import { Injectable } from '@angular/core';
import { BaseEvent, ParseToBaseEvent, ToBaseEvent, ToDrawingEvent } from './EventQueue';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { WEB_SOCKET_SERVER } from '../../configs/routing.consants';
import { BehaviorSubject, EMPTY, Subject, catchError, filter, map, tap } from 'rxjs';
import { WSEvent, WSEventType } from '../to-python-server/web-socket-model';
import { ComparisonResult, EventsCompositionService } from './events-composition.service';
import { ConflictResolverService } from './conflict-resolver.service';
import { isNil } from 'lodash';

@Injectable()
export class SyncingService {
  private _ws?: WebSocketSubject<WSEvent>;
  private _allEventsChanges = new BehaviorSubject<BaseEvent>(null!);
  private _allEventsReset = new Subject<void>();
  private _allEventsBaseEvent: BaseEvent[] = [];

  constructor(private _eventsCompositionService: EventsCompositionService, private _conflictResolver: ConflictResolverService) {
  }

  public listen(boardId: string) {
    this._ws = webSocket(WEB_SOCKET_SERVER + '/' + boardId);
    this._listen();

    return this;
  }

  public peerCheck(currentEvents: BaseEvent[]) {
    this._allEventsBaseEvent = currentEvents;
    this._allEventsReset.next();
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
    this._allEventsBaseEvent.push(event);
    this._ws?.next({
      data: event,
      type: WSEventType.DRAWING_EVENT
    });
  }

  public onEventAdded() {
    return this._allEventsChanges.pipe((filter(x => !isNil(x))));
  }

  public onEventsReset() {
    return this._allEventsReset.pipe((map(() => this._allEventsBaseEvent)));
  }

  private _onMessageReceive(data: WSEvent) {
    // console.log('Receiving ', data);
    switch (data.type) {
      case WSEventType.DRAWING_EVENT:
        this._handleAdded(data.data);
        break;
      case WSEventType.ASK_OTHER_CLIENTS:
        // console.log('responding that', this._allEventsBaseEvent);
        this._ws?.next({
          type: WSEventType.OTHER_CLIENT_RESPONDED,
          data:  this._allEventsBaseEvent
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

  private _handleAdded(data: BaseEvent | string | undefined | BaseEvent[]) {
    const received = ParseToBaseEvent(data)!;
    this._allEventsBaseEvent.push(received);
    this._allEventsChanges.next(received);
  }

  private _handleAddedMultiple(data: WSEvent) {
    (data.data as any[]).forEach(element => {
      this._handleAdded(element);
    });
  }

  private _handleComparisionREsult(comparison: ComparisonResult, data: WSEvent) {
    console.debug(comparison.toString());
    switch (comparison) {
      // TODO: If they're equal -> ignore
      case ComparisonResult.EQUAL:
        return;
      // TODO: If the up coming is more than all -> do render, do save
      case ComparisonResult.ADDED:
        this._handleAddedMultiple(data);
        return;
      // TODO: If they're conflict at some point -> replace the local storage, build all again with the up coming
      case ComparisonResult.CONFLICT:
        const solvedConflict = this._conflictResolver.resolve((data.data as any[]).map(x => ParseToBaseEvent(x)!) as BaseEvent[],
          this._allEventsBaseEvent);
        if (solvedConflict !== this._allEventsBaseEvent) {
          this._allEventsBaseEvent = solvedConflict;
          this._allEventsReset.next();
        }
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
