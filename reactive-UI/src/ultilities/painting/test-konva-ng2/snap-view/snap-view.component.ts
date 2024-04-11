import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import Konva from 'konva';
import { Subject } from 'rxjs';
import { ExtendedSimpleChanges } from '../../../types/type-simple-changes';

@Component({
  selector: 'snap-view',
  standalone: true,
  imports: [],
  templateUrl: './snap-view.component.html',
  styleUrl: './snap-view.component.scss'
})
export class SnapViewComponent implements AfterViewInit, OnChanges {

  reRenderRequests: Subject<void> = new Subject<void>();

  @Input()
  stageDimention = {
    width: 0,
    height: 0,
  }

  @Input()
  stagePosition = {
    x: 0,
    y: 0
  }

  @Input()
  stageScale: number = 1;

  snapStage?: Konva.Stage;
  snapLayer?: Konva.Layer;

  ngAfterViewInit(): void {
    this.reRenderRequests
      .subscribe(() =>{
        this._guaranteeStageInitiated();
        this._updateSnapView();
      });
  }

  
  ngOnChanges(changes: ExtendedSimpleChanges<SnapViewComponent>): void {
    if (changes.reRenderRequests && changes.reRenderRequests.currentValue) {
      this._initiateReRenderSubscription();
    }

    if (changes.stageDimention) {
      console.log('dimention changed', this.stageDimention);
      this._guaranteeStageInitiated();
    }

    if (changes.stagePosition) {
      console.log('position changed', this.stagePosition);
      this.reRenderRequests.next();
    }

    if (changes.stageScale) {
      console.log('scale changed', this.stageScale);
      this.reRenderRequests.next();
    }
  }
  private _initiateReRenderSubscription() {

  }

  private _guaranteeStageInitiated() {
    if (!this.stageDimention.height) {
      return;
    }

    if (this.snapStage && this.snapLayer) {
      if (!this.snapStage.height()) {
        return;
      }

      const ratioDifference = Math.abs(this.snapStage.width() / this.snapStage.height() - this.stageDimention.width / this.stageDimention.height);

      if (ratioDifference > 0.9 && ratioDifference < 1.1) {
        return;
      }
    }
    const desiredRatio = this.stageDimention.width / this.stageDimention.height;

    this.snapStage = new Konva.Stage({
      container: 'snap-view', 
      width: 100 * desiredRatio,
      height: 100
    });

    this.snapLayer = new Konva.Layer();
    this.snapStage.add(this.snapLayer);
    const snapRect = new Konva.Rect({
      width: 100 * desiredRatio,
      height: 100,
      stroke: 'red',
      strokeWidth: 1,
      draggable: true,
    });

    this.snapLayer.add(snapRect);
  }

  private _updateSnapView() {
    const scaleX = this.stageDimention.width / this.snapStage!.width();
    const scaleY = this.stageDimention.height / this.snapStage!.height();

    const snapRect = this.snapLayer!.findOne('Rect');
    const desiredRatio = this.stageDimention.width / this.stageDimention.height;
    // dimentionHeight/5 = 100
    // dimentionWidth/5 = 100 * desiredRatio.
    // To chat gpt.
    snapRect!.width(100 * desiredRatio / this.stageScale);
    snapRect!.height(100 / this.stageScale);

    snapRect!.position({
      x: - this.stagePosition.x / this.stageScale / scaleX,
      y: - this.stagePosition.y / this.stageScale / scaleY
    });
  }
}
