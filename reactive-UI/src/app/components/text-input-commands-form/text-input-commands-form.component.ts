import { Component } from '@angular/core';
import { ModalContentComponent } from '../../../utilities/controls/form-modal/IModalContentComponent';
import { TextEditorComponent } from '../../../utilities/controls/text-editor/text-editor.component';

@Component({
  selector: 'app-text-input-commands-form',
  standalone: true,
  imports: [TextEditorComponent],
  templateUrl: './text-input-commands-form.component.html',
  styleUrl: './text-input-commands-form.component.scss'
})
export class TextInputCommandsFormComponent extends ModalContentComponent {

}
