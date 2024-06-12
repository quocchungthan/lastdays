import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { AbstractEventQueueItem, BaseEvent, BoardedCreatedEvent, InkAttachedToStickyNoteEvent, PencilUpEvent, StickyNoteMovedEvent, StickyNotePastedEvent } from '../../events/drawings/EventQueue';
import { IdentitiesService } from './identities.service';
import { UserIdentity } from './entities/Identity';
import { EventCode } from '../../events/drawings/EventCode';

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
