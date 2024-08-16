import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../../app/services/ui-notifications/toaster.service';
import { TranslateService } from '@ngx-translate/core';
import { SyncingService } from '../../../dependencies/syncing.service';
import { IdentitiesService } from '../../../app/services/data-storages/identities.service';

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
    private _toaster: ToasterService,
    private _identities: IdentitiesService) {
    this.chatBoxForm = this._formBuilder.group({
      message: ['', Validators.required]
    });

    this._syncingService.getOnlineStatus()
      .subscribe((onlineStatus: string) => {
        this.rawStatusClass = onlineStatus;
        this._tranlsate.get(onlineStatus, {
          '0': this._syncingService.participantCount
        })
        .subscribe((tranlated) => {
          this.onlineStatusAsString = tranlated;
        });
      });

    this._syncingService.getNewIdentitySubscription()
      .subscribe((newIdentity) => {
        this._identities.detail(newIdentity.id)
          .then((existed) => {
            if (existed) {
              if (existed.displayName !== newIdentity.displayName) {
                return this._identities.update(newIdentity);
              }
              return newIdentity;
            }

            return this._identities.create(newIdentity);
          })
          .then((updatedIdentity) => {
            
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
