import { afterNextRender, Component } from '@angular/core';
import { KONVA_CONTAINER } from '../../common.definitions/id.constants';
import { KonvaFunctionService } from '../../common.services/konva-functions.service';

@Component({
  selector: 'app-canvas-board',
  standalone: true,
  imports: [],
  providers: [KonvaFunctionService],
  templateUrl: './canvas-board.component.html',
  styleUrl: './canvas-board.component.scss'
})
export class CanvasBoardComponent {
  KONVA_CONTAINER = KONVA_CONTAINER;

  constructor(private konvaFunctions: KonvaFunctionService) {
    afterNextRender(() => {
      this.csrInit();
    });
  }

  csrInit() {
    this.konvaFunctions.initKonvaObject();
  }
}
