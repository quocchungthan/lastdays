import { Injectable } from '@angular/core';
import { UserIdentity } from './entities/Identity';
import { CrudBaseService } from './crudbase.service';

@Injectable({
  providedIn: 'root'
})
export class IdentitiesService extends CrudBaseService<UserIdentity> {
  public static USER_IDENTITY_KEY = "USER_IDENTITY_KEY";

  constructor() {
    super(UserIdentity);
    this._ensureMachineHasIdentity();
  }

  private _ensureMachineHasIdentity() {
    this._isMachineHavingUserIdentity()
      .then((isHaving) => {
        if (isHaving) {
          return;
        }

        return this._createIdentityForThisMachine();
      })
      .then(() => {
        // console.log('Done!');
      });
  }

  private _isMachineHavingUserIdentity() {
    return this.getCurrentIdentity()
      .then(x => !!x);
  }

  getCurrentIdentity() {
    const cachedId = localStorage.getItem(IdentitiesService.USER_IDENTITY_KEY);
    
    if (!cachedId) {
      return Promise.resolve(null);
    }

    return this.detail(cachedId);
  }

  private async _createIdentityForThisMachine() {
    const newIdentity = await this.create(new UserIdentity())
    localStorage.setItem(IdentitiesService.USER_IDENTITY_KEY, newIdentity.id);
  }
}
