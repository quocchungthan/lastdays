import { Injectable } from '@angular/core';
import { KonvaObjectService } from '../services/konva-object.service';
import Konva from 'konva';
import { Observable, of } from 'rxjs';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';

@Injectable()
export class RendererService implements IRendererService {
  private _viewPort?: Konva.Stage;

  constructor(konvaObjectService: KonvaObjectService) {
    konvaObjectService.viewPortChanges
      .subscribe((stage) => {
        this._viewPort = stage;
      });
  }
  recover(event: IEventGeneral): Promise<void> {
    return Promise.resolve();
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
    return of([]);
  }

  activateDragging(value: boolean) {
    if (!this._viewPort) return;
    this._viewPort.draggable(value);
  }
}
