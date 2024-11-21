import { debounceTime } from "rxjs/internal/operators/debounceTime";
import { ToolSelectionService } from "../../toolbar/tool-selection.service";

export abstract class BaseToolIconComponent {
  constructor(private toolSelectionService: ToolSelectionService, private toolName: string) {
    this.toolSelectionService
      .onToolSelected
      .pipe(debounceTime(100))
      .subscribe((selected) => {
        this.active = selected === this.toolName;
        this.afterActiveValueChange();
      });
  }
  select() {
    this.active = true;
    this.toolSelectionService.abortTheOthers(this.toolName);
  }

  abstract afterActiveValueChange(): void;
  active: boolean = true;
} 
