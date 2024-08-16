import { Injectable } from '@angular/core';
import { KONVA_CONTAINER } from '../../configs/html-ids.constants';

@Injectable()
export class CursorManager {
    textInput() {
        this._setCursorByStringValue('text');
    }

    pencil(): void {
        // TODO: do not wait for mouse down, just show it.
        this._setCursorByStringValue("url('/assets/marker.png') 0 16, auto");
    }

    grabbing() {
        this._setCursorByStringValue('grab');
    }

    reset() {
        this._setCursorByStringValue('default');
    }

    hide() {
        this._setCursorByStringValue('none');
    }

    private _setCursorByStringValue(value: string) {
        this._getCssBearer().style.cursor = value;
    }

    private _getCssBearer() {
        return document.getElementById(KONVA_CONTAINER)!;
    }
}