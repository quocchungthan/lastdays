import { HttpClient } from '@angular/common/http';
import { Component, effect, signal, WritableSignal } from '@angular/core';
import { MetaConfiguration } from '../../../dependencies/meta/model/configuration.interface';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { EventsCompositionService } from '@drawings/events-composition.service';
import { ToBaseEvent } from '@drawings/EventQueue';
import { BaseEvent } from '@drawings/BaseEvent';
import { isNil, omit } from 'lodash';
import { KonvaObjectService } from '@canvas-module/services/3rds/konva-object.service';
import Konva from 'konva';
import { SUPPORTED_COLORS } from '@config/theme.constants';
import { RectConfig } from 'konva/lib/shapes/Rect';

@Component({
  selector: 'debug-status-layer',
  standalone: true,
  imports: [],
  templateUrl: './status-layer.component.html',
  styleUrl: './status-layer.component.scss'
})
export class StatusLayerComponent {
  debugEnabled: boolean;
  _realTimeEvents: WritableSignal<BaseEvent[]> = signal([]);
  _debugEnabled: WritableSignal<boolean> = signal(false);
  realTimeEvents: BaseEvent[] = [];
  viewPort: WritableSignal<Konva.Stage | null> = signal(null);
  

  constructor(private _httpClient: HttpClient,
    private _activated: ActivatedRoute,
    private _eventCompositionService: EventsCompositionService,
    private _konvaObjectService: KonvaObjectService) {
    this.debugEnabled = false;
    _httpClient.get<MetaConfiguration>('/api/configuration')
      .pipe(catchError(() => {
        return of({debugMode: true});
      }))
      .subscribe((configuration) => {
        this._debugEnabled.set(configuration.debugMode);
      });

      _eventCompositionService.getLocalQueueChanged()
        .subscribe((events) => {
          this._realTimeEvents.set(events.map(ToBaseEvent)
            .filter(x => !isNil(x)).map(x => x as BaseEvent).sort((b, a) => a.modifiedTime.getTime() - b.modifiedTime.getTime()));
        });
      _konvaObjectService.viewPortChanges
        .subscribe(viewPort => {
          this.viewPort.set(viewPort);
        });

      effect(() => {
        this.debugEnabled = this._debugEnabled();
        this.realTimeEvents = this._realTimeEvents();
        if (!this.viewPort()) return;
        if (!this.debugEnabled) return;
        this._addRectLayer();
      });
  }

  private _addRectLayer() {
    const stage = this.viewPort();
    if (!stage) return;
    const layer = stage.children.find(x => x instanceof Konva.Layer && x.name() === "DEBUG_LAYER") ?? new Konva.Layer({name: "DEBUG_LAYER"});
    layer.removeChildren();
    const drawingLayer = stage.children.find(x => x instanceof Konva.Layer && x.name() === 'DRAWING_LAYER');
    drawingLayer?.children.forEach(child => {
      const rect: RectConfig = {
        x: child.x(),
        y: child.y(),
        height: child.height(),
        width: child.width(),
        stroke: SUPPORTED_COLORS[3],
        strokeWidth: 2,
        dash: [2, 10]
      };
      // TODO: the position of rects are not accurate.
      // console.log(child.className, rect);
      // layer.add(new Konva.Rect(rect));
    });
    stage.add(layer);
  }

  getEventDisplayString(e: BaseEvent) {
    const x = omit(e, ['boardId', 'createdByUserId', 'modifiedTime', 'code']) as any;

    if (x.points) {
      x.points = [x.points[0], x.points[1], x.points[x.points.length - 2], x.points[x.points.length - 1]].map((n: number) => Math.round(n));
    }
    
    return e.modifiedTime.toLocaleTimeString() + ": " + (e as any).code + " " + JSON.stringify(x);
  }
}
