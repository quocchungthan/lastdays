import { Injectable } from '@angular/core';
import { AbstractEventQueueItem, BoardedCreatedEvent, GeneralUndoEvent, InkAttachedToStickyNoteEvent, PencilUpEvent, PureQueue, StickyNoteMovedEvent, StickyNotePastedEvent, ToBaseEvent, ToDrawingEvent } from './EventQueue';
import { cloneDeep } from 'lodash';
import { PencilCommands } from '../../pages/board-detail/commands/pencil.command';
import { StickyNoteCommands } from '../../pages/board-detail/commands/sticky-notes.command';
import { EventCode } from './EventCode';

export enum ComparisonResult {
  EQUAL,
  ADDED,
  CONFLICT
}

@Injectable()
export class EventsCompositionService {
  private _queue: PureQueue = [];
  private _pencil!: PencilCommands;
  private _stickyNote!: StickyNoteCommands;

  constructor() {
  }

  compare(allEvents: PureQueue): ComparisonResult {
    let i = 0;
    while (i < allEvents.length && i < this._queue.length) {
      if (ToBaseEvent(allEvents[i])?.id !== ToBaseEvent(this._queue[i])?.id) {
        this._logConflictAt(i, allEvents);
        return ComparisonResult.CONFLICT;
      }

      ++ i;
    }

    if (allEvents[i]) {
      return ComparisonResult.ADDED;
    }

    if (this._queue[i]) {
      this._logConflictAt(i, allEvents);
      return ComparisonResult.CONFLICT;
    }

    return ComparisonResult.EQUAL;
  }

  private _logConflictAt(i: number, allEvents: PureQueue) {
    console.log('conflict at', i, allEvents.slice(i), 'compare to current: ', this._queue.slice(i));
  }

  getQueueLength() {
    return this._queue.length;
  }

  setPencil(pencil: PencilCommands) {
    this._pencil = pencil;

    return this;
  }

  setStickyNote(stickyNote: StickyNoteCommands) {
    this._stickyNote = stickyNote;

    return this;
  }

  build(queue: PureQueue) {
    this._queue = [];
    queue.forEach(element => {
      if (element instanceof GeneralUndoEvent) {
        this._rollbackOneAction();

        return;
      }

      this._queue.push(cloneDeep(element));
    });

    this._forAsync()
      .then(() => {
        console.log("Build done");
      });
  }

  private _rollbackOneAction() {
    var last = this._queue.pop();
    if (last?.code === EventCode.InkAttachedToStickyNote) {
      this._queue.pop();
    }
  }

  private async _forAsync() {
    for (let event of this._queue) {
      await this._handleEvent(event);
    }
  }

  private async _handleEvent(event: AbstractEventQueueItem) {
    if (event instanceof BoardedCreatedEvent) {
      return;
    }

    if (event instanceof PencilUpEvent) {
      this._pencil.parseFromEvent(event);

      return;
    }

    if (event instanceof StickyNotePastedEvent) {
      await this._stickyNote.parseFromEvent(event);

      return;
    }

    if (event instanceof InkAttachedToStickyNoteEvent) {
      this._stickyNote.attachInkToStickyNote(event);

      return;
    }

    if (event instanceof StickyNoteMovedEvent) {
      this._stickyNote.moveStickyNote(event);

      return;
    }

    throw new Error("Event has not been handled");
  }

  insert(event: AbstractEventQueueItem) {
    if (event instanceof GeneralUndoEvent) {
      if (this._queue.length < 2) {
        return;
      }

      this._rollbackOneAction();
      this._pencil.clearAll();
      this._forAsync()
        .then(() => {
          console.log("Build done");
        });
    } else {
      this._queue.push(cloneDeep(event));
      this._handleEvent(event)
        .then(() => {
          console.log('handle done');
        });
    }
    // TODO: interact with db outside of this service
    // TODO: send notification outside of this service.
  }
}
