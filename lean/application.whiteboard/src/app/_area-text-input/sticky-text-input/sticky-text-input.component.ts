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
  @Output()
  textSubmitted = new EventEmitter<string>();

  constructor(private rendererService: RendererService) {
    this.rendererService.dialogPositionAssigned
      .subscribe((p) => {
        console.log(p);
        this.assignedPosition = p;
        this.handlePositionChanged();
      });
  }

  ngOnInit(): void {
    
  }

  handlePositionChanged() {
    if (isNil(this.assignedPosition)) {
      this.hideTextInputContainer();
    } else {
      this.showContainerAt(this.assignedPosition);
    }
  }

  hideTextInputContainer() {
    if (!this.positionalContainer?.nativeElement) return;
    this.positionalContainer.nativeElement.style.display = 'none';
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
