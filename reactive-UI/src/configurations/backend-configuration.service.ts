import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BACKEND_ORIGIN } from '../app/configs/routing.consants';

@Injectable({
  providedIn: 'root'
})
export class BackendConfigurationService {

  private _preConfigMessage: string = '';

  constructor(private httpClient: HttpClient) { }

  loadAsync() {
    return new Promise<void>((res, rej) => {
      this.httpClient.get(REST_ENDPOINT_PREFIX)
      .subscribe((response) => {
        this._preConfigMessage = (response as any)['message'];
        res();
      });
    });
  }

  get preconfigMessage() {
    return this._preConfigMessage;
  }
}
