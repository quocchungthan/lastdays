import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { filter } from 'rxjs';

@Component({
  selector: 'form-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-modal.component.html',
  styleUrl: './form-modal.component.scss'
})
export class FormModalComponent implements OnInit {
  isOpening = false;

  constructor(private _formModalService: FormModalService) {
  }

  ngOnInit(): void {
    this._formModalService.onOpen()
      .pipe((filter(() => !this.isOpening)))
      .subscribe(() => {
        this.isOpening = true;
      });
  }
  
  handleSubmit() {
    this._formModalService.submitHitted();
  }

  handleCancel() {
    this.isOpening = false;
    this._formModalService.discard();
  }
}
