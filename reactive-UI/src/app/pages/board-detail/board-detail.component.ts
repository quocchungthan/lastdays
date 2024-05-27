import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';
import { KONVA_CONTAINER } from '../../configs/html-ids.constants';
import Konva from 'konva';
import { HORIZONTAL_SCROLL_BAR_SIZE } from '../../configs/html-native-size.constants';
import { Point } from '../../../ultilities/types/Point';
import { CanvasManager } from './Canvas.manager';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [TopbarComponent],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent implements AfterViewInit {
  KONVA_CONTAINER = KONVA_CONTAINER;

  @ViewChild('topBar')
  topBar: TopbarComponent | undefined;
  private _canvasManager: CanvasManager | undefined;

  constructor() {
  }

  ngAfterViewInit(): void {
    this._resetTheViewPort();
  }

  private _resetTheViewPort() {
    const scrollBarHeight = HORIZONTAL_SCROLL_BAR_SIZE;
    const viewPort = new Konva.Stage({
      container: KONVA_CONTAINER,
      width: window.innerWidth,
      height: window.innerHeight - (this.topBar?.height ?? 0) - scrollBarHeight
    });

    this._canvasManager = new CanvasManager(viewPort);
    this._canvasManager.drawBackground();
  }
}
