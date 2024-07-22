import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'form-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-modal.component.html',
  styleUrl: './form-modal.component.scss'
})
export class FormModalComponent implements OnInit {
  isOpening = false;
  cancelText = 'FORM_DIALOG_CANCEL';
  submitText = 'FORM_DIALOG_SUBMIT';

  constructor(private _formModalService: FormModalService, private _translateService: TranslateService) {
    this._translateService.get([this.cancelText, this.submitText])
      .subscribe((result) => {
        this.cancelText = result[this.cancelText];
        this.submitText = result[this.submitText];
      });
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
