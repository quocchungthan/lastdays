import { KONVA_CONTAINER } from '../../configs/html-ids.constants';

export interface ICursorManager {
    grabbing(): void;
    reset(): void;
    pencil(): void;
}

export class CursorManager implements ICursorManager {
    pencil(): void {
        // TODO: do not wait for mouse down, just show it.
        this._setCursorByStringValue("url('/assets/marker.png'), auto");
    }

    grabbing() {
        this._setCursorByStringValue('grab');
    }

    reset() {
        this._setCursorByStringValue('default');
    }

    private _setCursorByStringValue(value: string) {
        this._getCssBearer().style.cursor = value;
    }

    private _getCssBearer() {
        return document.getElementById(KONVA_CONTAINER)!;
    }
}