import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Point } from '../../share-models/Point';
import { ViewPortEventsManager } from './ViewPortEvents.manager';
import { Subject } from 'rxjs/internal/Subject';

@Injectable()
export class MomentumService {
  private _target: Konva.Stage | undefined;
  private _lastPos: Point = { x: 0, y: 0 };
  private _velocity = { x: 0, y: 0 };
  private _friction = 0.98; // Momentum friction to slow down the object
  private _onAnimated = new Subject<void>();
private momentumAnimationId: number | null = null;

  constructor(private _interactiveEventManager: ViewPortEventsManager) {}

  setTarget(newTarget: Konva.Stage) {
    this._removePreviousSubscription();
    this._target = newTarget!;
    this._lastPos.x = this._target.x();
    this._lastPos.y = this._target.y();

    return this;
  }

  get onAnimated() {
      return this._onAnimated.asObservable();
  }

  setupMomentum() {
    if (!this._target) return this;
    const rect = this._target;
    const maxVelocity = 10;  // Max velocity value

    this._interactiveEventManager.onTouchStart()
      .subscribe(() => {
        // If there's an active momentum animation, cancel it
        this._cancelSliding();
      });

    this._interactiveEventManager.onDragMove().subscribe(() => {
      const dx = rect.x() - this._lastPos.x;
      const dy = rect.y() - this._lastPos.y;
      // If there's an active momentum animation, cancel it
      this._cancelSliding();

      // Calculate the velocity on drag move
      this._velocity.x = dx;
      this._velocity.y = dy;
      // Calculate the current speed (magnitude of velocity vector)
      const speed = Math.sqrt(this._velocity.x * this._velocity.x + this._velocity.y * this._velocity.y);

      // Limit the speed to maxVelocity
      if (speed > maxVelocity) {
         const scalingFactor = maxVelocity / speed;
         this._velocity.x *= scalingFactor;
         this._velocity.y *= scalingFactor;
      }

      this._lastPos.x = rect.x();
      this._lastPos.y = rect.y();
    });

    // Handle drag end with momentum
    this._interactiveEventManager.onDragEnd().subscribe(() => {
      // const dragEndTime = Date.now();

      // Apply momentum animation after drag ends
      const animateMomentum = () => {
        this._velocity.x *= this._friction;
        this._velocity.y *= this._friction;

        // If velocity is still significant, continue the animation
        if (
          Math.abs(this._velocity.x) > 0.2 ||
          Math.abs(this._velocity.y) > 0.2
        ) {
          rect.x(rect.x() + this._velocity.x);
          rect.y(rect.y() + this._velocity.y);

          rect.batchDraw();
          this.momentumAnimationId = requestAnimationFrame(animateMomentum);
        }
        this._onAnimated.next();
      };

      // Start momentum animation
      animateMomentum();
    });

    return this;
  }

  private _cancelSliding() {
    if (this.momentumAnimationId) {
      cancelAnimationFrame(this.momentumAnimationId);
      this.momentumAnimationId = null;
    }
  }

  private _removePreviousSubscription() {
    if (!this._target) return;
  }
}
