import {Injectable } from '@angular/core';

@Injectable()
export class ViewportSizeService {

  constructor() { }

  public blockTheWheel() {
    document.addEventListener('wheel', function(e) {
      e.preventDefault();
      e.stopPropagation();
  }, {
      passive: false // Add this
  });
  }
}
