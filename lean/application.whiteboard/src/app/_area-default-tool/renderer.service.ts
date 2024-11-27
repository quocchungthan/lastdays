import { Injectable } from '@angular/core';
import { KonvaObjectService } from '../services/konva-object.service';
import Konva from 'konva';
import { BehaviorSubject, filter, Observable, of, Subject } from 'rxjs';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { InstructionsService } from '../toolbar/instructions.service';

@Injectable()
export class RendererService implements IRendererService {
  private _viewPort?: Konva.Stage;
  private _instruction: BehaviorSubject<ShortcutInstruction[]> 
  private activated: boolean = true;

  constructor(konvaObjectService: KonvaObjectService, private _instructionsService: InstructionsService) {
    konvaObjectService.viewPortChanges.subscribe((stage) => {
      this._viewPort = stage;
    });
    this._instruction = new BehaviorSubject<ShortcutInstruction[]>(
      this._instructionsService.baseDefaultToolInstruction
    );
  }
  recover(event: IEventGeneral): Promise<void> {
    return Promise.resolve();
  }

  activateTool(selectedValue: boolean) {
    this.activated = selectedValue;
    if (this.activated) {
      this._instruction.next(this._instructionsService.baseDefaultToolInstruction);
    }
  }

  getInstructions(): Observable<ShortcutInstruction[]> {
    return this._instruction.asObservable().pipe(filter(() => this.activated));
  }

  activateDragging(value: boolean) {
    if (!this._viewPort) return;
    this._viewPort.draggable(value);
  }
}
