import { Injectable } from '@angular/core';
import { BrowserService } from '../services/browser.service';

@Injectable()
export class CursorService {
  constructor(private browserService: BrowserService) {}
  textInput() {
    this.browserService.setCursorByStringValue('text');
  }

  eraser() {
      this.browserService.setCursorByStringValue(
         "url('/tools/eraser.gif') 4 32, auto"
      );
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
