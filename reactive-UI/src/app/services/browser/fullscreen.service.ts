import { Injectable } from '@angular/core';

@Injectable()
export class FullScreenService {
  constructor() {}

  isFullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  requestFullscreen(): Promise<void> {
   const element = document.documentElement;
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if (
      // @ts-ignore
      element.webkitRequestFullscreen
    ) {
      // Safari
      // @ts-ignore
      return element.webkitRequestFullscreen();
      // @ts-ignore
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      // @ts-ignore
      return element.msRequestFullscreen();
    }
    return Promise.reject('Fullscreen API is not supported.');
  }

  exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
      // @ts-ignore
    } else if (document.webkitExitFullscreen) {
      // Safari
      // @ts-ignore
      return document.webkitExitFullscreen();
      // @ts-ignore
    } else if (document.msExitFullscreen) {
      // IE/Edge
      // @ts-ignore
      return document.msExitFullscreen();
    }
    return Promise.reject('Fullscreen API is not supported.');
  }
}
