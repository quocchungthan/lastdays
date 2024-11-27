import Konva from 'konva';
import { Observable, Subject, debounceTime, filter, finalize, map, takeUntil } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { Point } from '../../share-models/Point';
import { Wheel } from '../../share-models/Wheel';
import { KonvaObjectService } from './konva-object.service';
import isNil from 'lodash/isNil';

export enum KonvaMouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
}

@Injectable()
export class ViewPortEventsManager implements OnDestroy {
    private unsubscribe$ = new Subject<void>();
    private _dragStart: Subject<Point | null>;
    private _rightClicked = new Subject<Point | null>();
    private _dragMove: Subject<Point | null>;
    private _dragEnd: Subject<Point | null>;
    private _wheel: Subject<Wheel | null>;
    private _mouseEnter: Subject<void>;
    private _cursorMove: Subject<Point | null>;
    private _mouseOut: Subject<void>;
    private _touchStart: Subject<Point | null>;
    private _touchEnd: Subject<Point | null>;
    private _touchMove: Subject<Point | null>;
    private _viewPort!: Konva.Stage;
    
    constructor(_konvaObjects: KonvaObjectService) {
        _konvaObjects.viewPortChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(s => {
            this._viewPort = s;
            this._registerEventListener();
        })
        this._dragStart = new Subject<Point | null>();
        this._dragMove = new Subject<Point | null>();
        this._dragEnd = new Subject<Point | null>();
        this._touchStart = new Subject<Point | null>();
        this._touchEnd = new Subject<Point | null>();
        this._touchMove = new Subject<Point | null>();
        this._cursorMove = new Subject<Point | null>();
        this._mouseEnter = new Subject<void>();
        this._mouseOut = new Subject<void>();
        this._wheel = new Subject<Wheel | null>();
    }
    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public onMouseEnter() {
        return this._mouseEnter.asObservable();
    }

    public onMouseOut() {
        return this._mouseOut.asObservable();
    }

    public onCursorMove() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._cursorMove.asObservable());
    }

    public onWheel() {
        return this._wheel.asObservable().pipe((filter(x => !isNil(x) && !isNil(x.cursor))), map(x => x as Wheel), debounceTime(1));
    }

    public onRightClicked(target?: Konva.Shape) {
        if (!target) return this._rightClicked.asObservable();

        const observable = new Subject<Point | null>();

        target.on('mousedown touchstart', (e) => {
            // TODO: right test to cover right click cuz we use it later for menu context
            if (e.evt?.button === KonvaMouseButton.RIGHT) {
                observable.next(this._currentRelativePosition());
                e.evt.preventDefault();
                return;
            }
        });

        return observable.pipe(finalize(() => target.removeEventListener('mousedown touchstart')));
    }

    private _registerEventListener() {
        this._viewPort.on('dragstart', () => {
            this._dragStart.next(this._currentRelativePosition());
        });

        this._viewPort.on('wheel', (e) => {
            // how to scale? Zoom in? Or zoom out?
            let direction: 1 | -1 = e.evt.deltaY > 0 ? 1 : -1;

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (e.evt.ctrlKey) {
                direction = direction > 0 ? -1 : 1;
            }

            this._wheel.next({
                cursor: this._currentRelativePosition(),
                direction
            });
            e.evt.preventDefault();
        });

        this._viewPort.on('dragend', () => {
            this._dragEnd.next(this._currentRelativePosition());
        });

        this._viewPort.on('dragmove', () => {
            this._dragMove.next(this._currentRelativePosition());
        });

        this._viewPort.on('mousemove', () => {
            this._cursorMove.next(this._currentRelativePosition());
        });

        this._viewPort.on('mouseenter', () => {
            this._mouseEnter.next();
        });

        this._viewPort.on('mouseleave', () => {
            this._mouseOut.next();
        });

        this._viewPort.on('mousedown touchstart', (e) => {
            // TODO: right test to cover right click cuz we use it later for menu context
            if (e.evt?.button === KonvaMouseButton.RIGHT) {
                this._rightClicked.next(this._currentRelativePosition());
                e.evt.preventDefault();
                return;
            }
            this._touchStart.next(this._currentRelativePosition());
        });
          
        this._viewPort.on('mousemove touchmove', (e) => {
            if (e.evt?.button === KonvaMouseButton.RIGHT) {
                return;
            }
            this._touchMove.next(this._currentRelativePosition());
        });
        
        this._viewPort.on('mouseup touchend', (e) => {
            if (e.evt?.button === KonvaMouseButton.RIGHT) {
                return;
            }
            this._touchEnd.next(this._currentRelativePosition());
        });
    }

    private _currentRelativePosition(): Point | null {
        return this._viewPort.getRelativePointerPosition();
    }

    private _notNilPointsAndRemoveDuplicatedEvents(observer: Observable<Point | null>) {
        return observer.pipe((filter(x => !isNil(x))), map(x => x as Point), debounceTime(1))
    }

    public onDragStart() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._dragStart.asObservable());
    }

    public onDragMove() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._dragMove.asObservable());
    }

    public onDragEnd() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._dragEnd.asObservable());
    }

    public onTouchStart() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._touchStart.asObservable());
    }

    public onTouchMove() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._touchMove.asObservable());
    }

    public onTouchEnd() {
        return this._notNilPointsAndRemoveDuplicatedEvents(this._touchEnd.asObservable());
    }
}