import { Injectable } from '@angular/core';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import { filter } from 'rxjs/internal/operators/filter';

@Injectable()
export class RendererService {
  private _activated = false;

  constructor(private _interactiveEventService: ViewPortEventsManager) {
    this._listenToEvents();
  }

  public activateTool(value: boolean) {
    this._activated = value;
  }

  private _listenToEvents() {
    this._interactiveEventService.onTouchStart()
        .pipe(filter(() => this._activated))
        .subscribe((p) => {
            // if (this._toolComposition.tool === PencilCommands.CommandName) {
            //     this._pencil.penDown(p);
            // }
        });
    this._interactiveEventService.onTouchMove()
      .pipe(filter(() => this._activated))
        .subscribe((p) => {
            // if (this._toolComposition.tool === PencilCommands.CommandName) {
            //     this._pencil.penMove(p);
            // }
        });

    this._interactiveEventService.onTouchEnd()
      .pipe(filter(() => this._activated))
        .subscribe((p) => {
            // this._pencilEnd();
            // this._stickyNoteEnd(p);
            // this._textInputStart(p);
        });
    this._interactiveEventService.onMouseOut()
        .pipe(filter(() => this._activated))
        .subscribe((p) => {
            // this._pencilEnd();
        });
  }
}
