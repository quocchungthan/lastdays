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
         "url('/tools/eraser.png') 16 16, auto"
      );
  }

  pencil(): void {
    // TODO: do not wait for mouse down, just show it.
    this.browserService.setCursorByStringValue(
      "url('/assets/marker.png') 16 16, auto"
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
