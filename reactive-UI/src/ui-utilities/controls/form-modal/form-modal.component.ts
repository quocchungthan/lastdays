import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ComponentRef, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { filter } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ModalContentComponent } from './IModalContentComponent';

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
  
  @ViewChild('vcr', { static: true, read: ViewContainerRef })
  vcr!: ViewContainerRef;
  cdr = inject(ChangeDetectorRef);
  private _component!: ComponentRef<ModalContentComponent>;

  get dialogTitle() {
    return this._component?.instance?.dialogTitle ?? "";
  }

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
        this.renderDynamicComponents();
      });
  }
  
  handleSubmit() {
    this._formModalService.submitHitted();
    this.isOpening = false;
  }

  
  renderDynamicComponents() {
    const componentType = this._formModalService.getComponentType();
    // clear dynamic components shown in the container previously    
    this.vcr.clear();
    this._component = this.vcr.createComponent(componentType);
    this.cdr.detectChanges();
    this._formModalService.storeDialogContentComponent(this._component.instance);
  }

  handleCancel() {
    this.isOpening = false;
    this._formModalService.discard();
  }
}
