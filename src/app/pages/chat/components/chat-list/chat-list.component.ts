import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatItemComponent } from '../chat-item/chat-item.component';
import { ChatItem } from '../../interfaces/chat-item.interface';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [ChatItemComponent],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss'
})
export class ChatListComponent {
  @Input() public chats: ChatItem[] = [];
  @Output() public chatSelected = new EventEmitter<string>();

  public onChatSelected(chatId: string): void {
    this.chatSelected.emit(chatId);
  }
}
