import { Component } from '@angular/core';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';
import { BaseToolIconComponent } from '../../_area-base/tool-icon/tool-icon.component';
import { RendererService } from '../renderer.service';
import { ViewPortEventsManager } from '../../services/ViewPortEvents.manager';

@Component({
  selector: 'pencil-tool-icon',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent extends BaseToolIconComponent {
  constructor(toolSelectionService: ToolSelectionService, private rendererService: RendererService) {
    super(toolSelectionService, 'pencil');
  }

  override afterActiveValueChange(): void {
    this.rendererService.activateTool(this.active);
  }
}

