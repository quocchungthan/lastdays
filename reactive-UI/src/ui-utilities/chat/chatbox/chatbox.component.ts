import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../../app/services/ui-notifications/toaster.service';
import { TranslateService } from '@ngx-translate/core';
import { SyncingService } from '../../../dependencies/syncing.service';
import { IdentitiesService } from '../../../app/services/data-storages/identities.service';
import { SingleMessageData } from './single-message';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'chat-box',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.scss'
})
export class ChatboxComponent implements OnDestroy {
  isExpandingChatBox = false;
  chatBoxForm: FormGroup<{message: FormControl<string | null>}>;
  onlineStatusAsString: string = '';
  rawStatusClass: string = '';
  populatedChatMessages: SingleMessageData[] = [];
  private _joinedTheChannelText: string = 'JOIN_THE_CHANNEL';
  typingText: string = 'TYPING';
  youText: string = 'YOU';
  @ViewChild('scrollableBox')
  chatHistory: ElementRef | undefined;

  constructor(
    private _formBuilder: FormBuilder,
    private _tranlsate: TranslateService,
    private _syncingService: SyncingService,
    private _toaster: ToasterService,
    private _identities: IdentitiesService) {
    this.chatBoxForm = this._formBuilder.group({
      message: ['', Validators.required]
    });
    this._tranlsate.get([this._joinedTheChannelText, this.typingText, this.youText])
      .subscribe((translated) => {
        this._joinedTheChannelText = translated[this._joinedTheChannelText];
        this.typingText = translated[this.typingText];
        this.youText = translated[this.youText];
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

    this._syncingService.onChatMessageReceived()
      .subscribe(newText => {
        this.populatedChatMessages.push({
          messageText: newText.text,
          displayName: newText.displayName,
          time: new Date(),
          avatarUrl: this.fallbackAvatar()
        });
        this._scrollToBottom();
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
            this.populatedChatMessages.push({
              messageText: this._joinedTheChannelText,
              displayName: updatedIdentity.displayName || updatedIdentity.id,
              time: new Date(),
              avatarUrl: this.fallbackAvatar()
            });
            this._scrollToBottom();
          });
      });
  }
  ngOnDestroy(): void {
    this._syncingService.disconnect();
  }

  private fallbackAvatar(): string {
    return "http://gravatar.com/avatar/2c0ad52fc5943b78d6abe069cc08f320?s=32";
  }

  onSubmit() {
    if (!this.chatBoxForm.value.message) {
      return;
    }
    this._syncingService.trySendTextMessage(this.chatBoxForm.value.message);
    this.populatedChatMessages.push({
      messageText: this.chatBoxForm.value.message,
      displayName: this.youText,
      time: new Date(),
      avatarUrl: this.fallbackAvatar()
    });
    this.chatBoxForm.reset();
    this._scrollToBottom();
  }

  private _scrollToBottom() {
    setTimeout(() => {
      if (!this.chatHistory) {
        return;
      }

      this.chatHistory.nativeElement.scroll({ top: this.chatHistory.nativeElement.scrollHeight, behavior: 'smooth' });
    }, 100);    
  }

  minimizeChat(event: MouseEvent) {
    event.preventDefault();
    this.isExpandingChatBox = !this.isExpandingChatBox;
  }
}