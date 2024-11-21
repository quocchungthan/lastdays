import { Injectable } from '@angular/core';
import { KonvaObjectService } from '../services/konva-object.service';
import Konva from 'konva';

@Injectable()
export class RendererService {
  private _viewPort?: Konva.Stage;

  constructor(konvaObjectService: KonvaObjectService) {
    konvaObjectService.viewPortChanges
      .subscribe((stage) => {
        this._viewPort = stage;
      });
  }

  activateDragging(value: boolean) {
    if (!this._viewPort) return;
    this._viewPort.draggable(value);
  }
}
