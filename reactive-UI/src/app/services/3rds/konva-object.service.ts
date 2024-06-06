import { Injectable } from '@angular/core';
import Konva from 'konva';
import { KONVA_CONTAINER } from '../../configs/html-ids.constants';
import { HORIZONTAL_SCROLL_BAR_SIZE } from '../../configs/html-native-size.constants';
import { BehaviorSubject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KonvaObjectService {
  private _viewPort: BehaviorSubject<Konva.Stage | null> = new BehaviorSubject<Konva.Stage | null>(null);
  private _scrollBarHeight: number = HORIZONTAL_SCROLL_BAR_SIZE;
  private _yOffset: number = 0;

  constructor() { 
  }

  public initKonvaObject() {
    this._viewPort.next(new Konva.Stage({
      container: KONVA_CONTAINER,
      width: window.innerWidth,
      height: window.innerHeight - (this._yOffset) - this._scrollBarHeight,
      draggable: true,
    }));
  }

  public setYOffset(offsetInPixel: number) {
    this._yOffset = offsetInPixel;
    this._viewPort.getValue()?.height(window.innerHeight - this._yOffset - this._scrollBarHeight);
    this._viewPort.next(this._viewPort.getValue());
  }

  public get viewPortChanges () {
    return this._viewPort.pipe(filter(x => !!x), map(x => x as Konva.Stage));
  }
}
