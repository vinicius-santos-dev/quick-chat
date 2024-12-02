import { Component, Input, signal } from '@angular/core';
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
  @Input() chats: ChatItem[] = [];
}
