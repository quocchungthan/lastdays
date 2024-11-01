import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormModalService } from '../form-modal.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ModalContentComponent } from './IModalContentComponent';

@Component({
  selector: 'form-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-modal.component.html',
  styleUrl: './form-modal.component.scss',
})
export class FormModalComponent implements OnInit, AfterViewInit, OnDestroy {
  isOpening = false;
  cancelText = 'FORM_DIALOG_CANCEL';
  submitText = 'FORM_DIALOG_SUBMIT';

  @ViewChild('vcr', { static: true, read: ViewContainerRef })
  vcr!: ViewContainerRef;
  cdr = inject(ChangeDetectorRef);
  private _component!: ComponentRef<ModalContentComponent>;
  private unsubscribe$ = new Subject<void>();

  get dialogTitle() {
    return this._component?.instance?.dialogTitle ?? '';
  }

  constructor(
    private _formModalService: FormModalService,
    private _translateService: TranslateService
  ) {
    this._translateService
      .get([this.cancelText, this.submitText])
      .pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
        this.cancelText = result[this.cancelText];
        this.submitText = result[this.submitText];
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    // this._draggableDialog(); // TODO: later
  }

  ngOnInit(): void {
    this._formModalService
      .onOpen()
      .pipe(filter(() => !this.isOpening))
      .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.isOpening = true;
        this.renderDynamicComponents();
      });
    this._formModalService
      .onCancel()
      .pipe(filter(() => this.isOpening))
      .pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.isOpening = false;
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
    this._formModalService.storeDialogContentComponent(
      this._component.instance
    );
    this._component.instance.onPreviewCreated.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this._formModalService.firePreviewRendered();
    });
    this.cdr.detectChanges();
  }

  handleCancel() {
    this.isOpening = false;
    this._formModalService.discard();
  }

  private _draggableDialog() {
    // Make the DIV element draggable:
    dragElement(document.getElementById('mydiv')!);

    function dragElement(elmnt: HTMLElement) {
      var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      if (document.getElementById(elmnt.id + 'header')) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + 'header')!.onmousedown =
          dragMouseDown;
      } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e: MouseEvent) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
        elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
      }

      function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  }
}
