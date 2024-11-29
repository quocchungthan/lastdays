import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SyncingService } from '../business/syncing-service';
import { AssistantService } from '../business/assistant.service';

@Component({
  selector: 'app-assistant-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant-box.component.html',
  styleUrl: './assistant-box.component.scss'
})
export class AssistantBoxComponent {
  message: string = ''; // Stores the typed message
  isOnline: boolean = false; // Represents the online status of the assistant
  callbackFn?: (userPrompt: string) => void;
  private _focusing: boolean = false;

  constructor(syncing: SyncingService, private assistantService: AssistantService) {
    syncing.participantCount
      .subscribe((num) => {
        this.isOnline = !(num === 0);
      });

    this.assistantService.onPromptRequested()
      .subscribe((callback) => {
        this.callbackFn = callback;
        this.focusInput();
      });
  }

  get additionalCssClassForContainer() {
    return this._focusing ? 'opaque': '';
  }

  focusInput() {
    document.getElementById('assistant-input')?.focus();
  }

  // Toggle the online/offline status
  toggleStatus() {
    this.isOnline = !this.isOnline;
  }

  // Function to handle keyup event (press Enter to send message)
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') { // Check if Enter key is pressed
      this.sendMessage();
    } else if (event.key === 'Escape') {
      document.getElementById('assistant-input')?.blur();
    }
  }

  handleFocus($event: FocusEvent) {
    this._focusing = true;
  }
  
  // Function to handle message sending
  sendMessage() {
    if (this.message.trim()) {
      this.callbackFn?.(this.message.trim());
      console.log('Message Sent:', this.message);
      this.message = ''; // Clear the input after sending
    }
    
    if (this.callbackFn) {
      document.getElementById('assistant-input')?.blur();
    }
    this.callbackFn = undefined;
  }
  
  outFocus($event: FocusEvent) {
    this.callbackFn?.('');
    this.callbackFn = undefined;
    this._focusing = false;
  }
}
