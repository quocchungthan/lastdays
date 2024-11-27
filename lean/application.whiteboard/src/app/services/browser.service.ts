import { Injectable } from '@angular/core';
import { IEventGeneral } from '../../syncing-models/EventGeneral.interface';
import { debounceTime, Subject } from 'rxjs';
import { KONVA_CONTAINER } from '../../shared-configuration/html-ids.constants';

@Injectable({
  providedIn: 'root',
})
export class BrowserService {
  private dbName = 'eventsDB';
  private storeName = 'eventsStore';
  private db: IDBDatabase | undefined;
  private _undo = new Subject<void>();
  private _enter = new Subject<void>();
  private _escape = new Subject<void>();

  constructor() {
    this.openDatabase();
    this._registerKeyEvents();
    this.preventNativeMenuContext();
  }

  preventNativeMenuContext() {
    if (!document) return;

    document.addEventListener('contextmenu', e => e.preventDefault());
  }

  onUndo() {
    return this._undo.pipe(debounceTime(50));
  }

  onEnter() {
    return this._enter.pipe(debounceTime(50));
  }

  onEscape() {
    return this._escape.pipe(debounceTime(50));
  }
  

  setCursorByStringValue(value: string) {
    this._getCssBearer().style.cursor = value;
  }

  private _getCssBearer() {
    return document.getElementById(KONVA_CONTAINER)!;
  }

  private _registerKeyEvents() {
    if (!document) return;

    document.addEventListener('keydown', (event) => {
      // Check if Escape key is pressed
      if (event.key === 'Escape') {
        // Prevent the default behavior if needed
        event.preventDefault();
        // Handle Escape key action here
        this._escape.next();
      }

      // Check if the focus is on a text area or text input element
      const focusedElement = document.activeElement;
      const isInputElement = focusedElement instanceof HTMLTextAreaElement || focusedElement instanceof HTMLInputElement;

      // If the focus is on a text input or textarea, don't prevent default behavior
      if (isInputElement) return;
      // Check if Ctrl+Z (Cmd+Z for Mac) is pressed
      if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
        // Prevent the default behavior (undo)
        event.preventDefault();
        this._undo.next();
      }

      // Check if Enter key is pressed
      if (event.key === 'Enter') {
        // Prevent the default behavior if needed
        event.preventDefault();
        // Handle Enter key action here
        this._enter.next();
      }
    });
  }

  private openDatabase() {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBRequest).result;

      // Create the object store if not exist
      if (!db.objectStoreNames.contains(this.storeName)) {
        const objectStore = db.createObjectStore(this.storeName, {
          keyPath: 'eventId',
        });

        // Creating an index for quick retrieval by boardId
        objectStore.createIndex('boardId', 'boardId', { unique: false });

        // Add an additional column for future use
        objectStore.createIndex('additionalData', 'additionalData', {
          unique: false,
        });
      }
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBRequest).result;
    };

    request.onerror = (event) => {
      console.error('Error opening database:', event);
    };
  }

  storeEventAsync(event: IEventGeneral) {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject('db connection is not initiated');
        return;
      }
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // Add the event to the store, with an optional additional data field
      const eventWithAdditionalData = {
        ...event,
        additionalData: '', // Empty string, can be updated later
      };

      const request = store.put(eventWithAdditionalData);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error storing event:', event);
        reject(event);
      };
    });
  }

  loadAllEventRelatedToBoardAsync(boardId: string): Promise<IEventGeneral[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('db connection is not initiated');
        return;
      }
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('boardId');

      const request = index.openCursor(IDBKeyRange.only(boardId));
      const events: IEventGeneral[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          events.push(cursor.value);
          cursor.continue();
        } else {
          resolve(events);
        }
      };

      request.onerror = (event) => {
        console.error('Error loading events:', event);
        reject(event);
      };
    });
  }

  // Fullscreen functionality
  requestFullScreen() {
    const documentEl = document.documentElement;

    // Check if fullscreen is supported
    if (documentEl.requestFullscreen) {
      documentEl.requestFullscreen();
      // @ts-ignore
    } else if (documentEl.mozRequestFullScreen) {
      // Firefox
      // @ts-ignore
      documentEl.mozRequestFullScreen();
      // @ts-ignore
    } else if (documentEl.webkitRequestFullscreen) {
      // Chrome, Safari and Opera
      // @ts-ignore
      documentEl.webkitRequestFullscreen();
      // @ts-ignore
    } else if (documentEl.msRequestFullscreen) {
      // IE/Edge
      // @ts-ignore
      documentEl.msRequestFullscreen();
    } else {
      console.warn('Fullscreen API is not supported in this browser.');
    }
  }

  // Exit fullscreen functionality
  exitFullScreen() {
    // Check if exitFullscreen is supported
    if (document.exitFullscreen) {
      document.exitFullscreen();
      // @ts-ignore
    } else if (document.mozCancelFullScreen) {
      // Firefox
      // @ts-ignore
      document.mozCancelFullScreen();
      // @ts-ignore
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari, Opera
      // @ts-ignore
      document.webkitExitFullscreen();
      // @ts-ignore
    } else if (document.msExitFullscreen) {
      // IE/Edge
      // @ts-ignore
      document.msExitFullscreen();
    } else {
      console.warn('Exit Fullscreen API is not supported in this browser.');
    }
  }
}
