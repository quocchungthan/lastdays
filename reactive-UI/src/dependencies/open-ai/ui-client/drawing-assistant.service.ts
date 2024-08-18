import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetaConfiguration } from '../../meta/model/configuration.interface';

@Injectable({
  providedIn: 'root'
})
export class DrawingAssistantService {
  private _assistantEnabled: boolean = false;

  constructor(private _httpClient: HttpClient) { 
    _httpClient.get<MetaConfiguration>('/api/configuration')
      .subscribe((configuration) => {
        this._assistantEnabled = configuration.assistantEnabled;
      });
  }
}
