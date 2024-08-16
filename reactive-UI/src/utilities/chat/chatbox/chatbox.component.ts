import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../../app/services/ui-notifications/toaster.service';
import { TranslateService } from '@ngx-translate/core';
import { SyncingService } from '../../../dependencies/syncing.service';

@Component({
  selector: 'chat-box',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.scss'
})
export class ChatboxComponent {
  isExpandingChatBox = false;
  chatBoxForm: FormGroup<{message: FormControl<string | null>}>;
  onlineStatusAsString: string = '';
  rawStatusClass: string = '';

  constructor(
    private _formBuilder: FormBuilder,
    private _tranlsate: TranslateService,
    private _syncingService: SyncingService,
    private _toaster: ToasterService) {
    this.chatBoxForm = this._formBuilder.group({
      message: ['', Validators.required]
    });

    this._syncingService.getOnlineStatus()
      .subscribe((onlineStatus: string) => {
        this.rawStatusClass = onlineStatus;
        this._tranlsate.get(onlineStatus, {
          '{0}': this._syncingService.participantCount
        })
        .subscribe((tranlated) => {
          this.onlineStatusAsString = tranlated;
        });
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
