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
    this.rendererService.dialogPositionAssigned
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
    if (!this.positionalContainer?.nativeElement) return;

    this.positionalContainer.nativeElement.getElementsByTagName('input')
      [0].value = '';
  }

  focusToTheInput() {
    if (!this.positionalContainer?.nativeElement) return;

    this.positionalContainer.nativeElement.getElementsByTagName('input')
      [0].focus();
  }

  hideTextInputContainer() {
    if (!this.positionalContainer?.nativeElement) return;
    this.positionalContainer.nativeElement.style.display = 'none';
  }

  // Function to handle keyup event (press Enter to send message)
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') { // Check if Enter key is pressed
      this.rendererService.submitText((event.target as HTMLInputElement).value);
      this.assignedPosition = undefined;
      this.hideTextInputContainer();
    }
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
