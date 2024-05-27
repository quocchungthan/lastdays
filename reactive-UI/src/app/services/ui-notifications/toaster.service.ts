import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  error(message: string) {
    window.alert(message);
  }

  constructor() { }
}
