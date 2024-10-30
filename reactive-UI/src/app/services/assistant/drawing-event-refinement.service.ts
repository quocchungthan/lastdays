import { Injectable, OnDestroy } from '@angular/core';
import { UrlExtractorService } from '@browser/url-extractor.service';
import { PencilCommands } from '@canvas-module/commands/pencil.command';
import { StickyNoteCommands } from '@canvas-module/commands/sticky-notes.command';
import { TextInputCommands } from '@canvas-module/commands/text-input.command';
import { BaseEvent } from '@drawings/BaseEvent';
import { PencilUpEvent, StickyNotePastedEvent, TextEnteredEvent, ToDrawingEvent } from '@drawings/EventQueue';
import { AbstractEventQueueItem } from '@drawings/PureQueue.type';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawingEventRefinementService implements OnDestroy {
  private _boardId: string = '';
  private unsubscribe$ = new Subject<void>();

  constructor(private _urlExtractor: UrlExtractorService) { 
    this._urlExtractor.currentBoardIdChanges()
      .pipe(takeUntil(this.unsubscribe$)).subscribe((boardId) => {
        this._boardId = boardId;
      });
  }

  refine(generated: BaseEvent) {
    const mapped = ToDrawingEvent(generated);

    if (!mapped || !this._boardId) {
      throw new Error("Missing information");
    }

    if (mapped instanceof PencilUpEvent) {
      PencilCommands.fillEvent(mapped, this._boardId);
    }

    if (mapped instanceof StickyNotePastedEvent) {
      StickyNoteCommands.fillEvent(mapped, this._boardId);
    }

    if (mapped instanceof TextEnteredEvent) {
      TextInputCommands.fillEvent(mapped, this._boardId);
    }

    return mapped as BaseEvent & AbstractEventQueueItem;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
