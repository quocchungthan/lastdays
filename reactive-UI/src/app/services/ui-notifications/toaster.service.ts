import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  info(message: string | null | undefined) {
    window.alert(message);
  }
  
  error(message: string) {
    window.alert(message);
  }

  constructor() { }
}
