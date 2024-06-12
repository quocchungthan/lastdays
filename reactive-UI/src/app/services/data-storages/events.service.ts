import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { BaseEvent } from '../../events/drawings/EventQueue';
import { IdentitiesService } from './identities.service';
import { UserIdentity } from './entities/Identity';

@Injectable({
  providedIn: 'root'
})
export class EventsService extends CrudBaseService<BaseEvent> {

  constructor(private _identity: IdentitiesService) {
    super(BaseEvent);
   }

   override async index() {
    const all = await super.index();
    return all.map((x) => {
      if (typeof(x.modifiedTime) === 'string') {
        x.modifiedTime = new Date(Date.parse(x.modifiedTime));
      }
      return x;
    });
  }

  override async create(event: BaseEvent) {
    var identity: UserIdentity = (await this._identity.getCurrentIdentity())!;
    event.createdByUserId = identity.id;

    return await super.create(event);
  }
}
