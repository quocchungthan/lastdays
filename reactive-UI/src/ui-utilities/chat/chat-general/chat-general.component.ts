import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SingleMessageData } from '../chatbox/single-message';
import { EcomChatService } from '../services/ecom-chat.service';
import { IChatInteractionService } from '../../../app-ecom/core/contracts/chat-interaction.service.interface';

@Component({
  selector: 'chat-general',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './chat-general.component.html',
  styleUrl: './chat-general.component.scss'
})
export class ChatGeneralComponent {
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
  // TODO: make this as a input binding so the desired behavior depends on the context of the user component.
  private _interactiveChat: IChatInteractionService;

  constructor(
    private _formBuilder: FormBuilder,
    interactiveChat: EcomChatService,
    // TODO: translate service can be a pipe.
    private _tranlsate: TranslateService) {
    this._interactiveChat = interactiveChat;
    this.chatBoxForm = this._formBuilder.group({
      message: ['', Validators.required]
    });
    this._tranlsate.get([this._joinedTheChannelText, this.typingText, this.youText])
      .subscribe((translated) => {
        this._joinedTheChannelText = translated[this._joinedTheChannelText];
        this.typingText = translated[this.typingText];
        this.youText = translated[this.youText];
      });
    this._tranlsate.get("ONLINE")
      .subscribe((tranlated) => {
        this.onlineStatusAsString = tranlated;
      });
    // this._syncingService.getOnlineStatus()
    //   .subscribe((onlineStatus: string) => {
    //     this.rawStatusClass = onlineStatus;
    //     this._tranlsate.get(onlineStatus, {
    //       '0': this._syncingService.participantCount
    //     })
    //     .subscribe((tranlated) => {
    //       this.onlineStatusAsString = tranlated;
    //     });
    //   });

    // this._syncingService.onChatMessageReceived()
    //   .subscribe(newText => {
    //     this.populatedChatMessages.push({
    //       messageText: newText.text,
    //       displayName: newText.displayName,
    //       time: new Date(),
    //       avatarUrl: this.fallbackAvatar()
    //     });
    //     this._scrollToBottom();
    //   });

    // this._syncingService.getNewIdentitySubscription()
    //   .subscribe((newIdentity) => {
    //     this._identities.detail(newIdentity.id)
    //       .then((existed) => {
    //         if (existed) {
    //           if (existed.displayName !== newIdentity.displayName) {
    //             return this._identities.update(newIdentity);
    //           }
    //           return newIdentity;
    //         }

    //         return this._identities.create(newIdentity);
    //       })
    //       .then((updatedIdentity) => {
    //         this.populatedChatMessages.push({
    //           messageText: this._joinedTheChannelText,
    //           displayName: updatedIdentity.displayName || updatedIdentity.id,
    //           time: new Date(),
    //           avatarUrl: this.fallbackAvatar()
    //         });
    //         this._scrollToBottom();
    //       });
    //   });
  }
  ngOnDestroy(): void {
    // this._syncingService.disconnect();
  }

  private fallbackAvatar(): string {
    return "http://gravatar.com/avatar/2c0ad52fc5943b78d6abe069cc08f320?s=32";
  }

  onSubmit() {
    const userMessage = this.chatBoxForm.value.message;
    if (!userMessage) {
      return;
    }
    // this._syncingService.trySendTextMessage(userMessage);
    // this.populatedChatMessages.push({
    //   messageText: userMessage,
    //   displayName: this.youText,
    //   time: new Date(),
    //   avatarUrl: this.fallbackAvatar()
    // });
    // this._drawingAssistantService.generateDrawingEvents(userMessage)
    //   .subscribe((generated) => {
    //     generated.forEach(de => {
    //       this._eventCompositionService.insert(this._refinementService.refine(de));
    //     });
    //   });
    // this.chatBoxForm.reset();
    // this._scrollToBottom();
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
