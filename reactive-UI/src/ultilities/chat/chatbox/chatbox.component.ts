import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../../app/services/ui-notifications/toaster.service';

@Component({
  selector: 'chat-box',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.scss'
})
export class ChatboxComponent {
  isExpandingChatBox = true;
  chatBoxForm: FormGroup<{message: FormControl<string | null>}>;

  constructor(
    private _formBuilder: FormBuilder,
    private _toaster: ToasterService) {
    this.chatBoxForm = this._formBuilder.group({
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    this._toaster.info(this.chatBoxForm.value.message);
    this.chatBoxForm.reset();
  }

  minimizeChat(event: MouseEvent) {
    event.preventDefault();
    this.isExpandingChatBox = !this.isExpandingChatBox;
  }
}
