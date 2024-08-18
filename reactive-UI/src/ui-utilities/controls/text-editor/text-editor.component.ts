import { Component, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'text-editor',
  standalone: true,
  imports: [],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent {
  id = 'message';
  @Output()
  onTextChanged = new EventEmitter<string>();
  
  handleTextChanged(textAreaEvent: Event) {
    if (textAreaEvent.target instanceof HTMLTextAreaElement) {
      this.onTextChanged.emit(textAreaEvent.target.value);
    } else {
      throw new Error("Should have been the text area, otherwise text `.target.value` may not work");
    }
  }

  focus() {
    document.getElementById(this.id)
      ?.focus();
  }

  get width() {
    return document.getElementById(this.id)?.clientWidth ?? 100;
  }
}
