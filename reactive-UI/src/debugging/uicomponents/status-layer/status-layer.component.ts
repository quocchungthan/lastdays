import { HttpClient } from '@angular/common/http';
import { Component, effect, OnDestroy, signal, WritableSignal } from '@angular/core';
import { MetaConfiguration } from '../../../dependencies/meta/model/configuration.interface';
import { ActivatedRoute } from '@angular/router';
import { catchError, debounceTime, of, Subject, takeUntil } from 'rxjs';
import { EventsCompositionService } from '@drawings/events-composition.service';
import { ToBaseEvent } from '@drawings/EventQueue';
import { BaseEvent } from '@drawings/BaseEvent';
import { isNil, omit } from 'lodash';
import { KonvaObjectService } from '@canvas-module/services/3rds/konva-object.service';
import Konva from 'konva';
import { SUPPORTED_COLORS } from '@config/theme.constants';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { Point } from '@ui/types/Point';
import { Dimension } from '@ui/types/Dimension';
import { CANVAS_CHANGE_THROTTLE_TIME } from '@config/delay.constants';
import { EventDescriptionService } from '../event-description.service';

@Component({
  selector: 'debug-status-layer',
  standalone: true,
  imports: [],
  providers: [EventDescriptionService],
  templateUrl: './status-layer.component.html',
  styleUrl: './status-layer.component.scss'
})
export class StatusLayerComponent implements OnDestroy {
  debugEnabled: boolean;
  forcedOff: boolean = false;
  _realTimeEvents: WritableSignal<BaseEvent[]> = signal([]);
  _debugEnabled: WritableSignal<boolean> = signal(false);
  realTimeEvents: BaseEvent[] = [];
  viewPort: WritableSignal<Konva.Stage | null> = signal(null);
  private _requestAddRect = new Subject<void>();
  private unsubscribe$ = new Subject<void>();

  private _requestDescribeEvent = new Subject<void>();
  

  constructor(private _httpClient: HttpClient,
    private _activated: ActivatedRoute,
    private _eventCompositionService: EventsCompositionService,
    private _konvaObjectService: KonvaObjectService,
    private _eventDescriptionService: EventDescriptionService
  ) {
    this.debugEnabled = false;
    _httpClient.get<MetaConfiguration>('/api/configuration')
      .pipe(catchError(() => {
        return of({debugMode: true});
      }))
      .pipe(takeUntil(this.unsubscribe$)).subscribe((configuration) => {
        this._debugEnabled.set(configuration.debugMode);
      });

      _eventCompositionService.getLocalQueueChanged()
        .pipe(takeUntil(this.unsubscribe$)).subscribe((events) => {
          this._realTimeEvents.set(events.map(ToBaseEvent)
            .filter(x => !isNil(x)).map(x => x as BaseEvent).sort((b, a) => a.modifiedTime.getTime() - b.modifiedTime.getTime()));
        });
      _konvaObjectService.viewPortChanges
        .pipe(takeUntil(this.unsubscribe$)).subscribe(viewPort => {
          this.viewPort.set(viewPort);
        });
      this._requestAddRect
        .pipe(debounceTime(CANVAS_CHANGE_THROTTLE_TIME))
        .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          this._addRectLayer();
        });
      this._requestDescribeEvent
        .pipe(debounceTime(CANVAS_CHANGE_THROTTLE_TIME))
        .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          this._describeLastEvent();
        });
      effect(() => {
        this.debugEnabled = this._debugEnabled();
        this.realTimeEvents = this._realTimeEvents();
        this._eventDescriptionService.tryPreLoadSavedDescription(this.realTimeEvents.map(x => x.id));
        this._requestDescribeEvent.next();
        if (!this.viewPort()) return;
        if (!this.debugEnabled) return;
        this._requestAddRect.next();
      });
  }


  private _describeLastEvent() {
    if (!this.realTimeEvents.length) {
      return;
    }
    const lastEvent = this.realTimeEvents[0];
    if (this._eventDescriptionService.getFromCache(lastEvent.id)) return;
    const existingEvents = [...this.realTimeEvents];
    existingEvents.reverse();
    existingEvents.pop();

    this._eventDescriptionService.describeEvent(lastEvent, existingEvents);
  }

  forceDebugMode() {
    this.forcedOff = !this.forcedOff;
    this._requestAddRect.next();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private _addRectLayer() {
    const stage = this.viewPort();
    if (!stage) return;
    const layer = stage.children.find(x => x instanceof Konva.Layer && x.name() === "DEBUG_LAYER") ?? new Konva.Layer({name: "DEBUG_LAYER"});
    layer.removeChildren();
    if (this.forcedOff == true) {
      return;
    }
    const drawingLayer = stage.children.find(x => x instanceof Konva.Layer && x.name() === 'DRAWING_LAYER');
    drawingLayer?.children.forEach(child => {
      let bounderPosition: Point = { x: child.x(), y: child.y() };
      let bounderDimension: Dimension = { width: child.width(), height: child.height() };
      if (child.className === 'Line') {
        const lineRect = child.getClientRect();
        bounderPosition = { x: (lineRect.x - stage.x()) / stage.scaleX(), y: (lineRect.y - stage.y()) / stage.scaleY() };
        bounderDimension = { width: lineRect.width / stage.scaleX(), height: lineRect.height / stage.scaleY() };
      }

      if (child instanceof Konva.Group && child.width() * child.height() === 0 && child.hasChildren()) {
        bounderDimension = {
          width: child.children.reduce((a, c) => a > c.width() ? a : c.width() , 0),
          height: child.children.reduce((a, c) => a > c.height() ? a : c.height() , 0) 
        };
      }
      const rect: RectConfig = {
        x: bounderPosition.x,
        y: bounderPosition.y,
        height: bounderDimension.height,
        width: bounderDimension.width,
        stroke: SUPPORTED_COLORS[2],
        strokeWidth: 1,
        dash: [3, 5]
      };
      layer.add(new Konva.Rect(rect));
      layer.add(new Konva.Text({
        text: JSON.stringify({x: Math.round(bounderPosition.x), y: Math.round(bounderPosition.y)}),
        x: bounderPosition.x - 11,
        y: bounderPosition.y - 11,
        fontSize: 11,
        fontFamily: 'Baelast',
        fill: SUPPORTED_COLORS[2]
      }));
      layer.add(new Konva.Text({
        text: `${Math.round(bounderDimension.width)}x${Math.round(bounderDimension.height)}`,
        x: bounderPosition.x + bounderDimension.width - 22,
        y: bounderPosition.y + bounderDimension.height + 2,
        fontSize: 11,
        fontFamily: 'Baelast',
        fill: SUPPORTED_COLORS[2]
      }));
    });
    stage.add(layer);
    layer.setZIndex(0);
    drawingLayer?.setZIndex(2);
  }

  getEventDisplayString(e: BaseEvent) {
    const cached = this._eventDescriptionService.getFromCache(e.id);
    if (cached) {
      return cached;
    }
    const x = omit(e, ['boardId', 'createdByUserId', 'modifiedTime', 'code']) as any;

    if (x.points) {
      x.points = [x.points[0], x.points[1], x.points[x.points.length - 2], x.points[x.points.length - 1]].map((n: number) => Math.round(n));
    }
    
    return e.modifiedTime.toLocaleTimeString() + ": " + (e as any).code + " " + JSON.stringify(x);
  }
}
