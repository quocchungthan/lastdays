import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SUPPORTED_COLORS } from '../../../configs/theme.constants';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'color-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-board.component.html',
  styleUrl: './color-board.component.scss'
})
export class ColorBoardComponent {
  @Output() colorSelected = new EventEmitter<string>();
  @Input() selectedColor: string = '';
  colors: string[] = SUPPORTED_COLORS;

  @Input()
  multipleLine = false;

  selectColor(color: string) {
    this.colorSelected.emit(color);
  }
  
  isSelected(color: string): boolean {
    return color === this.selectedColor;
  }
}
