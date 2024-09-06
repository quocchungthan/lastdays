import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IdentitiesService } from '../../../app/services/data-storages/identities.service';
import { SingleMessageData } from './single-message';
import { DatePipe } from '@angular/common';
import { SyncingService } from '../../../dependencies/socket-communication/syncing.service';
import { DrawingAssistantService } from '@ai/ui-client/drawing-assistant.service';
import { DrawingEventRefinementService } from '../../../app/services/assistant/drawing-event-refinement.service';
import { UserDrawingLayerManager } from '@canvas-module/managers/UserDrawingLayer.manager';

@Component({
  selector: 'chat-box',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  providers: [],
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
    private _drawingAssistantService: DrawingAssistantService,
    private _refinementService: DrawingEventRefinementService,
    private _userDrawingManager: UserDrawingLayerManager,
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
    const userMessage = this.chatBoxForm.value.message;
    if (!userMessage) {
      return;
    }
    this._syncingService.trySendTextMessage(userMessage);
    this.populatedChatMessages.push({
      messageText: userMessage,
      displayName: this.youText,
      time: new Date(),
      avatarUrl: this.fallbackAvatar()
    });
    this._drawingAssistantService.generateDrawingEvents(userMessage, this._syncingService.getCurrentAllEvents())
      .subscribe(async (generated) => {
        for (let de of generated) {
          await this._userDrawingManager.generallyProcessNewEvent(this._refinementService.refine(de));
        }
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
