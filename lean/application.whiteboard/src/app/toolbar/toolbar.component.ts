import { Component } from '@angular/core';
import { SUPPORTED_COLORS } from '../../shared-configuration/theme.constants';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  isExpanded = false;
  showColorPicker = false;
  showShapePicker = false;
  selectedColor = SUPPORTED_COLORS[0];
  selectedShape = 'circle';

  colors = SUPPORTED_COLORS;
  shapes = ['circle', 'square', 'triangle'];

  expand() {
    this.isExpanded = true;
  }

  collapse() {
    this.isExpanded = false;
    this.showColorPicker = false;
    this.showShapePicker = false;
  }

  toggleColorPicker(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showColorPicker = !this.showColorPicker;
    this.showShapePicker = false;
  }

  toggleShapePicker(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.showShapePicker = !this.showShapePicker;
    this.showColorPicker = false;
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.showColorPicker = false;
  }

  selectShape(shape: string) {
    this.selectedShape = shape;
    this.showShapePicker = false;
  }
}
