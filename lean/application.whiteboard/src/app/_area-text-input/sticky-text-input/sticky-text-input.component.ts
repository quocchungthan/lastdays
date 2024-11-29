import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Point } from '../../../share-models/Point';
import { isNil } from 'lodash';
import { RendererService } from '../renderer.service';

@Component({
  selector: 'app-sticky-text-input',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './sticky-text-input.component.html',
  styleUrl: './sticky-text-input.component.scss'
})
export class StickyTextInputComponent implements OnInit {
  @ViewChild('positionalContainer') positionalContainer: ElementRef<HTMLElement> | undefined;
  assignedPosition?: Point;

  constructor(private rendererService: RendererService) {
    this.rendererService.inputPositionAssigned
      .subscribe((p) => {
        this.assignedPosition = p;
        this.handlePositionChanged();
      });
  }

  ngOnInit(): void {
    
  }

  handlePositionChanged() {
    if (isNil(this.assignedPosition)) {
      this.clearInput();
      this.hideTextInputContainer();
    } else {
      this.showContainerAt(this.assignedPosition);
      this.focusToTheInput();
    }
  }

  clearInput() {
    this.setInputInitValue('');
  }

  private setInputInitValue(v: string) {
    if (!this.positionalContainer?.nativeElement) return;
    this.positionalContainer.nativeElement.getElementsByTagName('textarea')[0].value = v;
  }

  focusToTheInput() {
    if (!this.positionalContainer?.nativeElement) return;
    var existingTextToEdit = this.rendererService.getOriginalTextForEdit();
    if (existingTextToEdit) {
      this.setInputInitValue(existingTextToEdit);
    }
    this.positionalContainer.nativeElement.getElementsByTagName('textarea')
      [0].focus();
  }

  hideTextInputContainer() {
    if (!this.positionalContainer?.nativeElement) return;
    this.positionalContainer.nativeElement.style.display = 'none';
  }

  // Function to handle keyup event (press Enter to send message)
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey) { // Check if Enter key is pressed
      this.onSubmit(event);
    }
  }

  onSubmit(event: Event) {
    const textArea = this.positionalContainer?.nativeElement.getElementsByTagName('textarea')[0];
    this.rendererService.submitText((textArea as HTMLTextAreaElement).value);
    this.assignedPosition = undefined;
    this.hideTextInputContainer();
  }

  showContainerAt(p: Point) {
    if (!this.positionalContainer?.nativeElement) return;
    const style = this.positionalContainer.nativeElement.style;
    style.display = 'flex';
    style.position = 'fixed';
    style.left = ((window.innerWidth / 2) + p.x) + 'px';
    style.top = ((window.innerHeight / 2) + p.y) + 'px';
  }
}
