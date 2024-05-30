export interface ICursorManager {
    grabbing(): void;
    reset(): void;
}

export class CursorManager {
    grabbing() {
        document.body.style.cursor = 'grab';
    }

    reset() {
        document.body.style.cursor = 'default';
    }
}