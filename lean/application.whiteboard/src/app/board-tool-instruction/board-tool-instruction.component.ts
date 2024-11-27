import { Component, OnDestroy } from '@angular/core';
import { PencilRendererService } from '../_area-pencil';
import { TextRendererService } from '../_area-text-input';
import { DefaultRendererService } from '../_area-default-tool';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { Subject, takeUntil } from 'rxjs';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';

@Component({
  selector: 'app-board-tool-instruction',
  standalone: true,
  providers: [],
  templateUrl: './board-tool-instruction.component.html',
  styleUrl: './board-tool-instruction.component.scss'
})
export class BoardToolInstructionComponent implements OnDestroy {
  private _rendererServices: IRendererService[] = [];
  private unsubscribe$ = new Subject<void>();
  instruction: ShortcutInstruction[] = [];
  

  constructor(tool1: PencilRendererService, tool2: TextRendererService, tool3: DefaultRendererService) {
    this._rendererServices.push(...[tool1, tool2, tool3]);
    this.onInstructionChanges();
  }

  onInstructionChanges() {
    this._rendererServices.forEach((tool) => {
      tool.getInstructions()
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((instruction) => {
          this.instruction = instruction;
        });
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
