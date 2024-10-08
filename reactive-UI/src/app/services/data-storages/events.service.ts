import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { BoardedCreatedEvent, GeneralUndoEvent, InkAttachedToStickyNoteEvent, PencilUpEvent, StickyNoteMovedEvent, StickyNotePastedEvent, TextAttachedToStickyNoteEvent, TextEnteredEvent } from '../../events/drawings/EventQueue';
import { IdentitiesService } from './identities.service';
import { UserIdentity } from './entities/Identity';
import { EventCode } from '../../events/drawings/EventCode';
import { BaseEvent } from '../../events/drawings/BaseEvent';
import { AbstractEventQueueItem } from '../../events/drawings/PureQueue.type';

@Injectable({
  providedIn: 'root'
})
export class EventsService extends CrudBaseService<BaseEvent> {

  constructor(private _identity: IdentitiesService) {
    super(BaseEvent);
   }

   async indexAndMap(id: string): Promise<AbstractEventQueueItem[]> {
    const all = await this.index();
    return all.map((x) => {
      if (x.boardId !== id) {
        return null!;
      }
      switch ((x as unknown as AbstractEventQueueItem).code) {
        case EventCode.BoardCreated:
          return new BoardedCreatedEvent(x as BoardedCreatedEvent);
        case EventCode.PencilUp:
          return new PencilUpEvent(x as PencilUpEvent);
        case EventCode.StickyNotePasted:
          return new StickyNotePastedEvent(x as StickyNotePastedEvent);
        case EventCode.InkAttachedToStickyNote:
          return new InkAttachedToStickyNoteEvent(x as InkAttachedToStickyNoteEvent);
        case EventCode.StickyNoteMoved:
          return new StickyNoteMovedEvent(x as StickyNoteMovedEvent);
        case EventCode.GENERAL_UNDO:
          return new GeneralUndoEvent(x as GeneralUndoEvent);
        case EventCode.TextEntered:
          return new TextEnteredEvent(x as TextEnteredEvent);
        case EventCode.TextAttachedToStickyNote:
          return new TextAttachedToStickyNoteEvent(x as TextAttachedToStickyNoteEvent);
        default:
          throw Error("Please handle this code" + (x as unknown as AbstractEventQueueItem).code);
      }
    })
    .filter(x => x != null)
    .sort(x => x.modifiedTime.getTime() - x.modifiedTime.getTime());
  }

  override async create(event: BaseEvent) {
    var identity: UserIdentity = (await this._identity.getCurrentIdentity())!;
    event.createdByUserId = identity.id;

    return await super.create(event);
  }
}
