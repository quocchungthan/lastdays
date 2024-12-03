import { Component } from '@angular/core';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';
import { BaseToolIconComponent } from '../../_area-base/tool-icon/tool-icon.component';
import { RendererService } from '../renderer.service';
import { StickyNoteRendererService } from '../../_area-sticky-note';

@Component({
  selector: 'default-tool-icon',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent extends BaseToolIconComponent {
  constructor(toolSelectionService: ToolSelectionService, private rendererService: RendererService, private stickyNoteRendererService: StickyNoteRendererService) {
    super(toolSelectionService, 'default');
  }

  override afterActiveValueChange() {
    this.rendererService.activateTool(this.active);
    this.rendererService.activateDragging(this.active);
    this.stickyNoteRendererService.draggable(this.active);
  }
}
