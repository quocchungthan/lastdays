import { Component } from '@angular/core';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';

@Component({
  selector: 'pencil-tool-icon',
  standalone: true,
  imports: [],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent {
    /**
   *
   */
    constructor(private toolSelectionService: ToolSelectionService) {
      this.toolSelectionService
        .onToolSelected
        .subscribe((selected) => this.active = selected === 'pencil');
    }
    select() {
      this.active = true;
      this.toolSelectionService.abortTheOthers('pencil');
    }
    active: boolean = true;
} 
