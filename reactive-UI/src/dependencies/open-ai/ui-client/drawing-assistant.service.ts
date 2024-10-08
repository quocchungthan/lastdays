import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetaConfiguration } from '../../meta/model/configuration.interface';
import { GENERATE_DRAWING_EVENTS, OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { GenerateDrawingEvent } from '@ai/model/GenerateDrawingEvent.req';
import { BaseEvent } from '@drawings/BaseEvent';
import { map, of } from 'rxjs';

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

  generateDrawingEvents(userMessage: string, existingEvents: any[]) {
    if (!this._assistantEnabled) {
      return of([]);
    };

    return this._httpClient.post<BaseEvent[][]>(OPEN_AI_ENDPOINT_PREFIX + GENERATE_DRAWING_EVENTS, {
      userMessage: userMessage,
      existingDrawingEvents: existingEvents
    } as GenerateDrawingEvent)
      .pipe(map((choices) => {
        return choices[0] ?? [];
      }));
  }
}
