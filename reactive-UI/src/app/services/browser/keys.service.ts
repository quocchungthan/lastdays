import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeysService {

  constructor() { }

  onUndo() {
    // TODO: subscribe subject
    document.addEventListener('keydown', function(event) {
      // Check if Ctrl+Z (Cmd+Z for Mac) is pressed
      if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
        // Prevent the default behavior (undo)
        event.preventDefault();
        console.log("Ctrl+Z prevented!");
      }
    });
  }
}
