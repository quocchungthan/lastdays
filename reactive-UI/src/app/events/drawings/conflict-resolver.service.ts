import { Injectable } from '@angular/core';
import { BaseEvent } from './EventQueue';

@Injectable({
  providedIn: 'root'
})
export class ConflictResolverService {

  constructor() { }

  resolve(events: BaseEvent[], localEvents: BaseEvent[]): BaseEvent[] {
    if ((events as BaseEvent[]).length > localEvents.length) {
      return events;
    } else {
      return localEvents;
    }
  }
}
