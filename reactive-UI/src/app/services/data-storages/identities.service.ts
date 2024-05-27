import { Injectable } from '@angular/core';
import { UserIdentity } from './entities/Identity';
import { CrudBaseService } from './crudbase.service';

@Injectable({
  providedIn: 'root'
})
export class IdentitiesService extends CrudBaseService<UserIdentity> {
  constructor() {
    super();
   }
}
