import { Injectable } from '@angular/core';
import { AbstractEventQueueItem, BoardedCreatedEvent, InkAttachedToStickyNoteEvent, PencilUpEvent, PureQueue, StickyNoteMovedEvent, StickyNotePastedEvent } from './EventQueue';
import { cloneDeep } from 'lodash';
import { PencilCommands } from '../../pages/board-detail/commands/pencil.command';
import { StickyNoteCommands } from '../../pages/board-detail/commands/sticky-notes.command';

@Injectable()
export class EventsCompositionService {
  private _queue: PureQueue = [];
  private _pencil!: PencilCommands;
  private _stickyNote!: StickyNoteCommands;

  constructor() {
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
    this._queue = cloneDeep(queue);
    this._forAsync()
      .then(() => {
        console.log("Build done");
      });
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
    this._queue.push(cloneDeep(event));
    this._handleEvent(event)
      .then(() => {
        console.log('handle done');
      });
    // TODO: interact with db outside of this service
    // TODO: send notification outside of this service.
  }
}
