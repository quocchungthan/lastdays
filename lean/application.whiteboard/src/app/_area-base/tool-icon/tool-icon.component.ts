import { ToolSelectionService } from "../../toolbar/tool-selection.service";

export class BaseToolIconComponent {
  constructor(private toolSelectionService: ToolSelectionService, private toolName: string) {
    this.toolSelectionService
      .onToolSelected
      .subscribe((selected) => this.active = selected === this.toolName);
  }
  select() {
    this.active = true;
    this.toolSelectionService.abortTheOthers(this.toolName);
  }
  active: boolean = true;
} 
