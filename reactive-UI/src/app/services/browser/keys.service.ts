import { Injectable } from '@angular/core';
import { debounceTime } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class KeysService {
  private _undo = new Subject<void>();

  constructor() {
    // TODO: subscribe subject
    document.addEventListener('keydown', (event) => {
      // Check if Ctrl+Z (Cmd+Z for Mac) is pressed
      if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
        // Prevent the default behavior (undo)
        event.preventDefault();
        this._undo.next();
      }
    });
   }

  onUndo() {
    return this._undo.pipe((debounceTime(50)));
  }
}
