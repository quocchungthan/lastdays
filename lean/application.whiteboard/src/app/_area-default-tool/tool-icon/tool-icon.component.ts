import { Component } from '@angular/core';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';

@Component({
  selector: 'default-tool-icon',
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
      .subscribe((selected) => this.active = selected === 'default');
  }
  select() {
    this.active = true;
    this.toolSelectionService.abortTheOthers('default');
  }
  active: boolean = true;
}
