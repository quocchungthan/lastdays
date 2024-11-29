import { Component, ElementRef, ViewChild } from '@angular/core';
import { isNil } from 'lodash';
import { Point } from '../../../share-models/Point';
import { RendererService } from '../renderer.service';
import { MenuContextOption } from './menu-context.option';

@Component({
  selector: 'text-input-menu-context',
  standalone: true,
  imports: [],
  templateUrl: './menu-context.component.html',
  styleUrl: './menu-context.component.scss',
})
export class MenuContextComponent {
  @ViewChild('positionalContainer') positionalContainer:
    | ElementRef<HTMLElement>
    | undefined;
  assignedPosition?: Point;

  /**
   export class MenuContextOption {
    label: string = '';
    callback: () => void = () => {}
  }
   * 
   */
  options: MenuContextOption[] = [
    { label: 'Edit', callback: () => this.edit() },
  ];

  constructor(private rendererService: RendererService) {
    this.rendererService.menuContextPositionAssigned.subscribe((p) => {
      this.assignedPosition = p;
      this.handlePositionChanged();
    });
  }

  ngOnInit(): void {}

  handlePositionChanged() {
    if (isNil(this.assignedPosition)) {
      this.hideContainer();
    } else {
      this.showContainerAt(this.assignedPosition);
    }
  }

  hideContainer() {
    if (!this.positionalContainer?.nativeElement) return;
    this.positionalContainer.nativeElement.style.display = 'none';
  }

  showContainerAt(p: Point) {
    if (!this.positionalContainer?.nativeElement) return;
    const style = this.positionalContainer.nativeElement.style;
    style.display = 'flex';
    style.position = 'fixed';
    style.left = window.innerWidth / 2 + p.x + 'px';
    style.top = window.innerHeight / 2 + p.y + 'px';
  }

  // Handler for option click
  edit() {
    this.rendererService.startEditExistingText();
  }
}
