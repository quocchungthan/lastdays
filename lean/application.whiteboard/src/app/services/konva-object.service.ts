import { Injectable } from '@angular/core';
import Konva from 'konva';
import { BehaviorSubject, filter, map } from 'rxjs';
import { KONVA_CONTAINER } from '../../shared-configuration/html-ids.constants';

@Injectable()
export class KonvaObjectService {
  private _viewPort: BehaviorSubject<Konva.Stage | null> = new BehaviorSubject<Konva.Stage | null>(null);

  constructor() { 
  }

  public initKonvaObject() {
    const newViewPort = new Konva.Stage({
      container: KONVA_CONTAINER,
      width: window.innerWidth - 10,
      height: window.innerHeight - 10,
      draggable: true,
    });
    const drawingLayer = new Konva.Layer({
      name: 'DrawingLayer'
    });
    newViewPort.add(drawingLayer);
    this._viewPort.next(newViewPort);
  }

  public adaptViewPortSize() {
    this._viewPort.getValue()?.height(window.innerHeight - 10);
    this._viewPort.getValue()?.width(window.innerWidth - 10);
    this._viewPort.next(this._viewPort.getValue());
  }

  public get viewPortChanges () {
    return this._viewPort.pipe(filter(x => !!x), map(x => x as Konva.Stage));
  }
}
