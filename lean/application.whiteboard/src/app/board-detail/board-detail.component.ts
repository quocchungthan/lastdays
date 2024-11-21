import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { KONVA_CONTAINER } from '../../shared-configuration/html-ids.constants';
import { KonvaObjectService } from '../services/konva-object.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { BackgroundLayerManager } from '../services/BackgroundLayer.manager';
import { Subject } from 'rxjs';
import { ViewPortEventsManager } from '../services/ViewPortEvents.manager';
import Konva from 'konva';
import { Wheel } from '../../share-models/Wheel';
import { MomentumService } from '../services/BackgroundMomentum.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [ToolbarComponent],
  providers: [
    KonvaObjectService,
    BackgroundLayerManager,
    ViewPortEventsManager,
    MomentumService
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss',
})
export class BoardDetailComponent implements AfterViewInit, OnDestroy {
  KONVA_CONTAINER = KONVA_CONTAINER;

  private unsubscribe$ = new Subject<void>();

  /**
   *
   */
  constructor(
    private _konvaObjectService: KonvaObjectService,
    private _backgroundLayerManager: BackgroundLayerManager,
    private _interactiveEventManager: ViewPortEventsManager
  ) {}

  @HostListener('window:resize')
  public onWindowResize(e: any) {
    this._konvaObjectService.adaptViewPortSize();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => this._resetTheViewPort());
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this._interactiveEventManager.ngOnDestroy();
    this._backgroundLayerManager.ngOnDestroy();
  }

  private _resetTheViewPort() {
    this._konvaObjectService.initKonvaObject();
    this._konvaObjectService.adaptViewPortSize();
    this._konvaObjectService.viewPortChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((stage) => {
        this._backgroundLayerManager.drawBackground();
        this.initiateBasedOnBackgroundStage(stage);
      });
  }

  private initiateBasedOnBackgroundStage(stage: Konva.Stage) {
    this._interactiveEventManager
      .onDragStart()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        // this._cursorManager.grabbing();
      });

    this._interactiveEventManager
      .onDragEnd()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this._backgroundLayerManager.putTheRuler();
      });

    this._interactiveEventManager
      .onTouchEnd()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        // if (!this.tool) {
        //     this._cursorManager.reset();
        // }
      });

    this._interactiveEventManager
      .onWheel()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((wheelEventData) => {
        this._backgroundLayerManager.putTheRuler();
        this._onRequestZooming(stage, wheelEventData);
      });
  }

  private _onRequestZooming(stage: Konva.Stage, wheelData: Wheel) {
    const scaleBy = 1.01;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (pointer === null) {
      //   console.log('Pointer can\'t be null');
      return;
    }

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const zoomInPercentage =
      wheelData.direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: zoomInPercentage, y: zoomInPercentage });
    const newPos = {
      x: pointer.x - mousePointTo.x * zoomInPercentage,
      y: pointer.y - mousePointTo.y * zoomInPercentage,
    };
    stage.position(newPos);
  }
}
