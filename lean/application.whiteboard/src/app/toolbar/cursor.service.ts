import { Injectable } from '@angular/core';
import { BrowserService } from '../services/browser.service';

@Injectable()
export class CursorService {
  constructor(private browserService: BrowserService) {}
  textInput() {
    this.browserService.setCursorByStringValue('text');
  }

  areaSelection() {
    this.browserService.setCursorByStringValue('crosshair');
  }

  eraser() {
      this.browserService.setCursorByStringValue(
         "url('/tools/eraser.gif') 4 32, auto"
      );
  }

  arrow() {
   // this.browserService.setCursorByStringValue(
   //    "url('/tools/arrow.gif') 4 32, auto"
   // );
   this.pencil();
}

  pencil(): void {
    this.browserService.setCursorByStringValue(
      "url('tools/pencil.gif') 1 32, auto"
    );
  }

  grabbing() {
    this.browserService.setCursorByStringValue('grab');
  }

  reset() {
    this.browserService.setCursorByStringValue('default');
  }

  hide() {
    this.browserService.setCursorByStringValue('none');
  }
}
