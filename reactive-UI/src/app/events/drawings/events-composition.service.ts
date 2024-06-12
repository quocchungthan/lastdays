import { Injectable } from '@angular/core';
import { UserDrawingLayerManager } from '../../pages/board-detail/managers/UserDrawingLayer.manager';
import { AbstractEventQueueItem, PureQueue } from './EventQueue';
import { cloneDeep } from 'lodash';

@Injectable()
export class EventsCompositionService {
  private _queue: PureQueue = [];

  constructor(private _userDrawing: UserDrawingLayerManager) { }

  build(queue: PureQueue) {
    this._queue = cloneDeep(queue);
    // TODO: draw
  }

  insert(event: AbstractEventQueueItem) {
    this._queue.push(cloneDeep(event));
    // TODO: draw.
    // TODO: interact with db outside of this service
    // TODO: send notification outside of this service.
  }
}
