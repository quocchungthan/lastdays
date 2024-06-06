import Konva from 'konva';
import { Observable, Subject, debounceTime, filter, map } from 'rxjs';
import { Point } from '../../../ultilities/types/Point';
import { isNil } from 'lodash';

export interface IViewPortEventsManager {
    onDragStart(): Observable<Point>;
    onDragEnd(): Observable<Point>;
    onMouseEnter(): Observable<void>;
    onMouseOut(): Observable<void>;
    onTouchStart(): Observable<Point>;
    onTouchMove(): Observable<Point>;
    onTouchEnd(): Observable<Point>;
}

export class ViewPortEventsManager implements IViewPortEventsManager {
    private _dragStart: Subject<Point | null>;
    private _dragEnd: Subject<Point | null>;
    private _mouseEnter: Subject<void>;
    private _mouseOut: Subject<void>;
    private _touchStart: Subject<Point | null>;
    private _touchEnd: Subject<Point | null>;
    private _touchMove: Subject<Point | null>;
    
    constructor(private _viewPort: Konva.Stage) {
        this._dragStart = new Subject<Point | null>();
        this._dragEnd = new Subject<Point | null>();
        this._touchStart = new Subject<Point | null>();
        this._touchEnd = new Subject<Point | null>();
        this._touchMove = new Subject<Point | null>();
        this._mouseEnter = new Subject<void>();
        this._mouseOut = new Subject<void>();

        this._registerEventListener();
    }

    public onMouseEnter() {
        return this._mouseEnter.asObservable();
    }

    public onMouseOut() {
        return this._mouseOut.asObservable();
    }

    private _registerEventListener() {
        this._viewPort.on('dragstart', () => {
            this._dragStart.next(this._currentRelativePosition());
        });

        this._viewPort.on('dragend', () => {
            this._dragEnd.next(this._currentRelativePosition());
        });

        this._viewPort.on('mouseenter', () => {
            this._mouseEnter.next();
        });

        this._viewPort.on('mouseleave', () => {
            this._mouseOut.next();
        });

        this._viewPort.on('mousedown touchstart', () => {
            this._touchStart.next(this._currentRelativePosition());
        });
          
        this._viewPort.on('mousemove touchmove', (e) => {
            this._touchMove.next(this._currentRelativePosition());
        });
        
        this._viewPort.on('mouseup touchend', (e) => {
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