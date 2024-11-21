import { Component } from '@angular/core';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';
import { BaseToolIconComponent } from '../../_area-base/tool-icon/tool-icon.component';
import { RendererService } from '../renderer.service';

@Component({
  selector: 'default-tool-icon',
  standalone: true,
  imports: [],
  providers: [RendererService],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent extends BaseToolIconComponent {
  constructor(toolSelectionService: ToolSelectionService, private rendererService: RendererService) {
    super(toolSelectionService, 'default');
  }

  override afterActiveValueChange() {
    this.rendererService.activateDragging(this.active);
  }
}
