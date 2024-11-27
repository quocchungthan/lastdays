import { Component } from '@angular/core';
import { RendererService } from '../renderer.service';
import { BaseToolIconComponent } from '../../_area-base/tool-icon/tool-icon.component';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';

@Component({
  selector: 'eraser-tool-icon',
  standalone: true,
  imports: [],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent extends BaseToolIconComponent {
  constructor(toolSelectionService: ToolSelectionService, private rendererService: RendererService) {
    super(toolSelectionService, 'delete-whole');
  }

  override afterActiveValueChange(): void {
    this.rendererService.activateTool(this.active);
  }
}