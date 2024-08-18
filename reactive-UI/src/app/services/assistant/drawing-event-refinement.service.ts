import { Injectable } from '@angular/core';
import { UrlExtractorService } from '@browser/url-extractor.service';
import { PencilCommands } from '@canvas-module/commands/pencil.command';
import { StickyNoteCommands } from '@canvas-module/commands/sticky-notes.command';
import { TextInputCommands } from '@canvas-module/commands/text-input.command';
import { BaseEvent } from '@drawings/BaseEvent';
import { PencilUpEvent, StickyNotePastedEvent, TextEnteredEvent, ToDrawingEvent } from '@drawings/EventQueue';

@Injectable({
  providedIn: 'root'
})
export class DrawingEventRefinementService {
  private _boardId: string = '';

  constructor(private _urlExtractor: UrlExtractorService) { 
    this._urlExtractor.currentBoardIdChanges()
      .subscribe((boardId) => {
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

    return mapped;
  }
}
