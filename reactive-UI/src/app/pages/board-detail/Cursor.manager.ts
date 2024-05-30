export interface ICursorManager {
    grabbing(): void;
    reset(): void;
    pencil(): void;
}

export class CursorManager implements ICursorManager {
    pencil(): void {
        throw new Error('Method not implemented.');
    }
    
    grabbing() {
        this._getCssBearer().style.cursor = 'grab';
    }

    reset() {
        this._getCssBearer().style.cursor = 'default';
    }

    private _getCssBearer() {
        return document.body;
    }
}