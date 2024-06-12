// tool-selector.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tool-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tool-selector.component.html',
  styleUrls: ['./tool-selector.component.scss']
})
export class ToolSelectorComponent {
  @Input() tools: Tool[] = [];
  @Input() selectedToolId: string | null = null; // New input to track the selected tool ID
  @Output() toolSelected = new EventEmitter<string>();

  selectTool(tool: Tool) {
    this.toolSelected.emit(tool.id);
  }

  isSelected(toolId: string): boolean {
    return toolId === this.selectedToolId;
  }
}

export interface Tool {
  id: string;
  label: string;
  iconUrl: string;
}
