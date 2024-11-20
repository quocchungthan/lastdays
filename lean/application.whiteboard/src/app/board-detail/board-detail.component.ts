import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { KONVA_CONTAINER } from '../../shared-configuration/html-ids.constants';
import { KonvaObjectService } from '../services/konva-object.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { BackgroundLayerManager } from '../services/BackgroundLayer.manager';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [],
  providers: [KonvaObjectService, BackgroundLayerManager],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent implements AfterViewInit, OnDestroy {
  KONVA_CONTAINER = KONVA_CONTAINER;

  private unsubscribe$ = new Subject<void>();

  /**
   *
   */
  constructor(private _konvaObjectService: KonvaObjectService, private _backgroundLayerManager: BackgroundLayerManager) {
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
  }

  private _resetTheViewPort() {
    this._konvaObjectService.initKonvaObject();
    this._konvaObjectService.adaptViewPortSize();
    this._konvaObjectService.viewPortChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this._backgroundLayerManager.drawBackground();
    });
  }
}
