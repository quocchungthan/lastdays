import { Injectable } from '@angular/core';
import { IChatInteractionService } from '../../../app-ecom/core/contracts/chat-interaction.service.interface';

@Injectable({
  providedIn: 'root'
})
export class EcomChatService implements IChatInteractionService {

  constructor() { }
}
