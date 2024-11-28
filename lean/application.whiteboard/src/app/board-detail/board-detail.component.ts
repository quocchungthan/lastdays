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

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [ToolbarComponent, AssistantBoxComponent, StickyTextInput, BoardToolInstructionComponent],
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
    CursorService
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss',
})
export class BoardDetailComponent implements AfterViewInit, OnDestroy {
  KONVA_CONTAINER = KONVA_CONTAINER;
  private _rendererServices: IRendererService[] = [];

  private unsubscribe$ = new Subject<void>();

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
  ) {
    this._rendererServices.push(...[pencilRendererService, _textRenderer, eraserRenderer]);
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
