import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  constructor(private toastr: ToastrService) {
    
  }
  info(message: string | null | undefined) {
    this.toastr.info(message ?? '');
  }
  
  error(message: string) {
    this.toastr.error(message);
  }
}
