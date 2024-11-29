import { Component } from '@angular/core';
import { RendererService } from '../renderer.service';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';
import { BaseToolIconComponent } from '../../_area-base/tool-icon/tool-icon.component';

@Component({
  selector: 'workflow-board-tool-icon',
  standalone: true,
  imports: [],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent extends BaseToolIconComponent {
  constructor(toolSelectionService: ToolSelectionService, private rendererService: RendererService) {
    super(toolSelectionService, 'workflow-board');
  }

  override afterActiveValueChange(): void {
    this.rendererService.activateTool(this.active);
  }
}

