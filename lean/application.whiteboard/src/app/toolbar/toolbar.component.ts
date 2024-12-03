import { Component } from '@angular/core';
import { SUPPORTED_COLORS } from '../../shared-configuration/theme.constants';
import { PencilToolIcon } from '../_area-pencil';
import { DefaultToolIcon } from '../_area-default-tool';
import { ToolSelectionService } from './tool-selection.service';
import { TextInputToolIcon } from '../_area-text-input';
import { EraserToolIcon } from '../_area-delete-whole';
import { ToolIconComponent } from "../_area-moving-arrow/tool-icon/tool-icon.component";
import { WorkflowBoardToolIcon } from '../_area-workflow-board';
import { StickyNoteToolIcon } from '../_area-sticky-note';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [PencilToolIcon, DefaultToolIcon, TextInputToolIcon, EraserToolIcon, ToolIconComponent, WorkflowBoardToolIcon, StickyNoteToolIcon],
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

  constructor(private _toolSelection: ToolSelectionService){}

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
    this._toolSelection.selectColor(color);
    this.showColorPicker = true;
  }

  selectShape(shape: string) {
    this.selectedShape = shape;
    this.showShapePicker = false;
  }
}
