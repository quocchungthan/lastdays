import { Component } from '@angular/core';
import { BaseToolIconComponent } from '../../_area-base/tool-icon/tool-icon.component';
import { ToolSelectionService } from '../../toolbar/tool-selection.service';
import { RendererService } from '../renderer.service';

@Component({
  selector: 'text-input-tool-icon',
  standalone: true,
  imports: [],
  providers: [RendererService],
  templateUrl: './tool-icon.component.html',
  styleUrl: './tool-icon.component.scss'
})
export class ToolIconComponent  extends BaseToolIconComponent {
  constructor(toolSelectionService: ToolSelectionService, private rendererService: RendererService) {
    super(toolSelectionService, 'text-input');
  }

  override afterActiveValueChange(): void {
  }
}