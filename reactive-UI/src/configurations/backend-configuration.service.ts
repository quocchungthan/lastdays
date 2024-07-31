import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { REST_ENDPOINT_PREFIX } from '../app/configs/routing.consants';

export enum SiteType {
  Undefined = 0,
  Commercial = 1,
  Golf = 2,
};

@Injectable({
  providedIn: 'root'
})
export class BackendConfigurationService {

  private _preConfigMessage: string = '';
  private _siteType: SiteType = SiteType.Commercial;

  constructor(private httpClient: HttpClient) { }

  loadAsync() {
    return new Promise<void>((res, rej) => {
      this.httpClient.get(REST_ENDPOINT_PREFIX)
      .subscribe((response) => {
        const reponseData = response as any;
        
        this._preConfigMessage = reponseData['message'];
        this._siteType = reponseData['siteType'];
        res();
      });
    });
  }

  get preconfigMessage() {
    return this._preConfigMessage;
  }

  get isGolf() {
    return this._siteType === SiteType.Golf;
  }
}
