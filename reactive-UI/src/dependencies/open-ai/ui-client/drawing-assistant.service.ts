import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MetaConfiguration } from '../../meta/model/configuration.interface';
import { GENERATE_DRAWING_EVENTS, OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { GenerateDrawingEvent } from '@ai/model/GenerateDrawingEvent.req';
import { BaseEvent } from '@drawings/BaseEvent';
import { map, of, Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawingAssistantService implements OnDestroy {
  private _assistantEnabled: boolean = false;
  private unsubscribe$ = new Subject<void>();

  constructor(private _httpClient: HttpClient) {
    _httpClient.get<MetaConfiguration>('/api/configuration')
      .pipe(takeUntil(this.unsubscribe$)).subscribe((configuration) => {
        this._assistantEnabled = configuration.assistantEnabled;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
