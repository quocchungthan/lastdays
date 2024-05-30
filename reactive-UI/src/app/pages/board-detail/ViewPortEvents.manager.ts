import Konva from 'konva';
import { Observable, Subject, filter, map } from 'rxjs';
import { Point } from '../../../ultilities/types/Point';
import { isNil } from 'lodash';

export interface IViewPortEventsManager {
    onDragStart(): Observable<Point>;
    onDragEnd(): Observable<Point>;
}

export class ViewPortEventsManager implements IViewPortEventsManager {
    private _dragStart: Subject<Point | null>;
    private _dragEnd: Subject<Point | null>;
    
    constructor(private _viewPort: Konva.Stage) {
        this._dragStart = new Subject<Point | null>();
        this._dragEnd = new Subject<Point | null>();

        this._registerEventListener();
    }

    private _registerEventListener() {
        this._viewPort.on('dragstart', () => {
            this._dragStart.next(this._viewPort.getRelativePointerPosition());
        });

        this._viewPort.on('dragend', () => {
            this._dragEnd.next(this._viewPort.getRelativePointerPosition());
        });
    }

    private _notNilPoints(observer: Observable<Point | null>) {
        return observer.pipe((filter(x => !isNil(x))), map(x => x as Point))
    }

    public onDragStart() {
        return this._notNilPoints(this._dragStart.asObservable());
    }

    public onDragEnd() {
        return this._notNilPoints(this._dragEnd.asObservable());
    }
}