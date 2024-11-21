import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  // Toggle the online/offline status
  toggleStatus() {
    this.isOnline = !this.isOnline;
  }

  // Function to handle keyup event (press Enter to send message)
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') { // Check if Enter key is pressed
      this.sendMessage();
    }
  }
  
  // Function to handle message sending
  sendMessage() {
    if (this.message.trim()) {
      console.log('Message Sent:', this.message);
      this.message = ''; // Clear the input after sending
    }
  }
}
