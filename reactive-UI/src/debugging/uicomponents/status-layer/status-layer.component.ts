import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MetaConfiguration } from '../../../dependencies/meta/model/configuration.interface';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { EventsCompositionService } from '@drawings/events-composition.service';
import { ToBaseEvent } from '@drawings/EventQueue';
import { BaseEvent } from '@drawings/BaseEvent';
import { isNil, omit } from 'lodash';

@Component({
  selector: 'debug-status-layer',
  standalone: true,
  imports: [],
  templateUrl: './status-layer.component.html',
  styleUrl: './status-layer.component.scss'
})
export class StatusLayerComponent {
  debugEnabled: boolean;
  realTimeEvents: BaseEvent[] = [];

  constructor(private _httpClient: HttpClient,
    private _activated: ActivatedRoute,
    private _eventCompositionService: EventsCompositionService) {
    this.debugEnabled = false;
    _httpClient.get<MetaConfiguration>('/api/configuration')
      .pipe(catchError(() => {
        return of({debugMode: true});
      }))
      .subscribe((configuration) => {
        this.debugEnabled = configuration.debugMode;
      });

      _eventCompositionService.getLocalQueueChanged()
        .subscribe((events) => {
          this.realTimeEvents = events.map(ToBaseEvent)
            .filter(x => !isNil(x)).map(x => x as BaseEvent).sort((b, a) => a.modifiedTime.getTime() - b.modifiedTime.getTime());
        });
  }

  getEventDisplayString(e: BaseEvent) {
    const x = omit(e, ['boardId', 'createdByUserId', 'modifiedTime', 'code']) as any;

    if (x.points) {
      x.points = [x.points[0], x.points[1], x.points[x.points.length - 2], x.points[x.points.length - 1]].map((n: number) => Math.round(n));
    }
    
    return e.modifiedTime.toLocaleTimeString() + ": " + (e as any).code + " " + JSON.stringify(x);
  }
}
