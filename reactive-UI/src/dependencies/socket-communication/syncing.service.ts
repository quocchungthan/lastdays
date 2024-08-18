import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket'
import { BehaviorSubject, EMPTY, Observable, Subject, catchError, filter, map, tap } from 'rxjs';
import { isNil } from 'lodash';
import { ChatTextEventData, SayHelloEventData, WSEvent, WSEventType } from './web-socket-model';
import { UserIdentity } from '@uidata/entities/Identity';
import { IdentitiesService } from '@uidata/identities.service';
import { SEGMENT_TO_BOARD_DETAIL, WEB_SOCKET_PATH } from '@config/routing.consants';
import { BaseEvent } from '@drawings/BaseEvent';
import { ConflictResolverService } from '@drawings/conflict-resolver.service';
import { ToDrawingEvent, ParseToBaseEvent } from '@drawings/EventQueue';
import { EventsCompositionService, ComparisonResult } from '@drawings/events-composition.service';

export const StatusTranslatatbleString = {
  Offline: "OFFLINE",
  Online: "ONLINE",
  ParticipantsCount: "PARTICIPANTS"
}

@Injectable({
  providedIn: 'root'
})
export class SyncingService {
  private _ws?: WebSocketSubject<WSEvent>;
  private _allEventsChanges = new BehaviorSubject<BaseEvent>(null!);
  private _allEventsReset = new Subject<void>();
  private _allEventsBaseEvent: BaseEvent[] = [];

  /**
   * 0 => disconnected
   * 1 => 1 participant = the current user
   * > 1 => other participants are online
   */
  private _onlineStatusChanged = new BehaviorSubject<number>(0);
  private _participantIdentitiesChanges: Observable<UserIdentity>;
  private _nextParticipantSayHello!: (value?: UserIdentity | undefined) => void;
  private _currentUser: UserIdentity | null | undefined;
  private _chatMessageSubscription!: Observable<ChatTextEventData>;
  private _nextMessageReceived!: (value?: ChatTextEventData | undefined) => void;

  constructor(
    private _eventsCompositionService: EventsCompositionService, 
    private _conflictResolver: ConflictResolverService,
    private _identityService: IdentitiesService) {

    this._participantIdentitiesChanges = new Observable<UserIdentity>((observer) => {
      this._nextParticipantSayHello = observer.next.bind(observer);
    });

    this._chatMessageSubscription = new Observable<ChatTextEventData>((observer) => {
      this._nextMessageReceived = observer.next.bind(observer);
    });

    this._identityService.getCurrentIdentity()
      .then((s) => {
        this._currentUser = s;
      });
  }

  public onChatMessageReceived() {
    return this._chatMessageSubscription;
  }
  
  disconnect() {
    this._ws?.unsubscribe();
    this._ws = undefined;
  }

  public listen(boardId: string) {
    const self = this;
    if (this._ws) {
      return this;
    }
    this._ws = webSocket({
      url: 'ws://localhost:' + document.location.port + WEB_SOCKET_PATH + '?' + SEGMENT_TO_BOARD_DETAIL + '=' + boardId,
      closeObserver: {
        next() {
          self._onlineStatusChanged.next(0);
        }
      },
      openObserver: {
        next() {
          self._onlineStatusChanged.next(1);
          self.sayHelloToOtherParticipants();
        }
      }
    });
    this._listen();

    return this;
  }

  get participantCount() {
    return this._onlineStatusChanged.value;
  }

  getNewIdentitySubscription() {
    return this._participantIdentitiesChanges.pipe(filter(x => !!x && x.id !== this._currentUser?.id));
  }

  async sayHelloToOtherParticipants() {
    const currentUser = await this._identityService.getCurrentIdentity();
    this._ws?.next({
      data: {
        user: currentUser
      } as SayHelloEventData,
      type: WSEventType.SAY_HELLO
    });
  }

  public getOnlineStatus() {
    return this._onlineStatusChanged
      .pipe(map((status) => {
        switch (status) {
          case 0:
            return StatusTranslatatbleString.Offline;
          case 1:
            return StatusTranslatatbleString.Online;
          default:
            return StatusTranslatatbleString.ParticipantsCount
        }
      }));
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

  public trySendTextMessage(msg: string) {
    this._ws?.next({
      data: {
        text: msg,
        displayName: this._currentUser?.displayName || this._currentUser?.id
      } as ChatTextEventData,
      type: WSEventType.CHAT
    });
  }

  public onEventAdded() {
    return this._allEventsChanges.pipe((filter(x => !isNil(x))));
  }

  public onEventsReset() {
    return this._allEventsReset.pipe((map(() => this._allEventsBaseEvent)));
  }

  private _onMessageReceive(data: WSEvent) {
    switch (data.type) {
      case WSEventType.SAY_HELLO:
        this._nextParticipantSayHello((data.data as SayHelloEventData).user);
        break;
      case WSEventType.PARTICIPANTS_COUNT_UPDATE:
        this._onlineStatusChanged.next(data.data as number);
        break;
      case WSEventType.DRAWING_EVENT:
        this._handleAdded(data.data as BaseEvent);
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
        this._nextMessageReceived(data.data as ChatTextEventData);
        break;
    }
  }

  private _handleAdded(data: BaseEvent) {
    const received = ParseToBaseEvent(data)!;
    this._allEventsBaseEvent.push(received);
    this._allEventsChanges.next(received);
  }

  private _handleAddedMultiple(data: WSEvent) {
    const events = data.data as any[];
    let index = 0;
    var internval = setInterval(() => {
      if (index >=events.length) {
        clearInterval(internval);
      } else {
        this._handleAdded(events[index]);
        index ++;
      }
      // TODO: temporary solution for waiting promises
    }, 50);
  }

  private _handleComparisionREsult(comparison: ComparisonResult, data: WSEvent) {
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
