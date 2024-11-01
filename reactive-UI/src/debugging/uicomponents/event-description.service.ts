import { DrawingAssistantService } from '@ai/ui-client/drawing-assistant.service';
import { Injectable, OnDestroy } from '@angular/core';
import { BaseEvent } from '@drawings/BaseEvent';
import { Subject, takeUntil } from 'rxjs';

@Injectable()
export class EventDescriptionService implements OnDestroy {
  private static KEY_PREFIX = 'DESCRIBE_EVENT_';
  private unsubscribe$ = new Subject<void>();
  private _mappedEventDescription: { [key in string]: string } = {};

  constructor(private _drawingAssistantService: DrawingAssistantService) {}

  tryPreLoadSavedDescription(eventIds: string[]) {
    if (!eventIds.length) {
      return;
    }

    eventIds.forEach((e) => {
      const saved = localStorage.getItem(
        EventDescriptionService.KEY_PREFIX + e
      );
      if (!saved) return;
      this._mappedEventDescription[e] = saved;
    });
  }

  getFromCache(eventId: string) {
    return this._mappedEventDescription[eventId];
  }

  describeEvent(lastEvent: BaseEvent, existingEvents: BaseEvent[] = []) {
    this._drawingAssistantService
      .describeDrawingEvent(lastEvent, existingEvents)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        localStorage.setItem(
          EventDescriptionService.KEY_PREFIX + response.eventId,
          response.description
        );
        this._mappedEventDescription[response.eventId] = response.description;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
