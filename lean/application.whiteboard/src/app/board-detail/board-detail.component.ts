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
import { AssistantBoxComponent } from "../assistant-box/assistant-box.component";
import { PencilRendererService } from '../_area-pencil';
import { IRendererService } from '../_area-base/renderer.service.interface';
import { BoardsService } from '../business/boards.service';
import { getBoardId } from '../../utils/url.helper';
import { retryAPromise } from '../../utils/promises.helper';
import { SyncingService } from '../business/syncing-service';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { StickyTextInput, TextRendererService } from '../_area-text-input';
import { BoardToolInstructionComponent } from "../board-tool-instruction/board-tool-instruction.component";
import { DefaultRendererService } from '../_area-default-tool';
import { InstructionsService } from '../toolbar/instructions.service';
import { EraserRendererService } from '../_area-delete-whole';
import { CursorService } from '../toolbar/cursor.service';
import { MovingArrowRendererService } from '../_area-moving-arrow';
import { MenuContextComponent } from "../_area-text-input/menu-context/menu-context.component";
import { WorkflowBoardRendererService } from '../_area-workflow-board';
import { AssistantService } from '../business/assistant.service';
import { Point } from '../../share-models/Point';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [ToolbarComponent, AssistantBoxComponent, StickyTextInput, BoardToolInstructionComponent, MenuContextComponent],
  providers: [
    KonvaObjectService,
    BackgroundLayerManager,
    ViewPortEventsManager,
    MomentumService,
    PencilRendererService,
    TextRendererService,
    DefaultRendererService,
    InstructionsService,
    EraserRendererService,
    CursorService,
    MovingArrowRendererService,
    WorkflowBoardRendererService
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss',
})
export class BoardDetailComponent implements AfterViewInit, OnDestroy {
  KONVA_CONTAINER = KONVA_CONTAINER;
  private _rendererServices: IRendererService[] = [];

  private unsubscribe$ = new Subject<void>();
  private _lastDistance: number = 0;
  private _lastScale: number = 1;

  /**
   *
   */
  constructor(
    private _konvaObjectService: KonvaObjectService,
    private _backgroundLayerManager: BackgroundLayerManager,
    private _interactiveEventManager: ViewPortEventsManager,
    private _boardsService: BoardsService,
    pencilRendererService: PencilRendererService,
    private _syncingService: SyncingService,
    private _textRenderer: TextRendererService,
    private eraserRenderer: EraserRendererService,
    private _assistantService: AssistantService,
    arrows: MovingArrowRendererService
  ) {
    this._rendererServices.push(...[pencilRendererService, _textRenderer, eraserRenderer, arrows]);
    this._assistantService.onEventGenerated()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((events) => this.recoverAll([events]));
  }

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
        this._recoverExistingEvents().then(() => {});
      });
  }

  private async _recoverExistingEvents() {
    const boardId = getBoardId(location.href)!;
    this._syncingService.listen(boardId);
    await this._loadFromDbAndRecover(boardId);
    await this._boardsService.askForExistingBoardFromPeersAsync(boardId);
    this._syncingService.onDataChange
        .subscribe(async () => {
          await this._loadFromDbAndRecover(boardId);
        });
  }

  private async _loadFromDbAndRecover(boardId: string) {
    const allEvents = await retryAPromise(() => this._boardsService.askForExistingBoardAsync(boardId));
    await this.recoverAll(allEvents);
  }

  private async recoverAll(events: IEventGeneral[]) {
    console.log(events);
    for (let e of events) {
      for (let s of this._rendererServices) {
        await s.recover(e);
      }
    }
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
    this._interactiveEventManager
      .onPinchStart()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((pinchData) => {
        this._backgroundLayerManager.putTheRuler();
        this._lastDistance = this._getDistance(pinchData);
        this._lastScale = stage.scaleX();
      });
    this._interactiveEventManager
      .onPinchMove()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((pinchData) => {
        this._backgroundLayerManager.putTheRuler();
        var newDistance = this._getDistance(pinchData);
        var scaleFactor = newDistance / this._lastDistance;
        
        // Zoom in or out based on the pinch distance change
        var newScale = this._lastScale * scaleFactor;

        // Set the zoom scale limit
        if (newScale < 0.1) newScale = 0.1;
        if (newScale > 10) newScale = 10;

        stage.scale({ x: newScale, y: newScale });

        // Adjust the stage position to zoom centered on the midpoint of the pinch
        var pointer = this._getMidpoint(pinchData);
        var dx = pointer.x - stage.x();
        var dy = pointer.y - stage.y();

        stage.position({
          x: pointer.x - dx * newScale / this._lastScale,
          y: pointer.y - dy * newScale / this._lastScale
        });

        stage.batchDraw();

        // Update last distance and scale for the next touchmove
        this._lastDistance = newDistance;
        this._lastScale = newScale;
      });
  }

  // Function to calculate the distance between two touch points
  private _getDistance(touches: Point[]) {
    var dx = touches[0].x - touches[1].x;
    var dy = touches[0].y - touches[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Function to get the midpoint between two touch points
  private _getMidpoint(touches: Point[]) {
    var x = (touches[0].x + touches[1].x) / 2;
    var y = (touches[0].y + touches[1].y) / 2;
    return { x: x, y: y };
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
