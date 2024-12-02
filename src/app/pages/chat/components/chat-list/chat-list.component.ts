import { Component, signal } from '@angular/core';
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
  protected readonly chats = signal<ChatItem[]>([
    {
      id: '1',
      displayName: 'John Doe',
      photoURL: 'assets/default-avatar.png',
      lastMessage: 'Hey, how are you?',
      timestamp: new Date('2024-12-02T14:30:00')
    },
    {
      id: '2',
      displayName: 'Jane Smith',
      photoURL: 'assets/default-avatar.png',
      lastMessage: 'Can we meet tomorrow?',
      timestamp: new Date('2024-12-01T13:45:00')
    },
    {
      id: '3',
      displayName: 'Lily Johnson',
      photoURL: 'assets/default-avatar.png',
      lastMessage: 'Thanks for your help!',
      timestamp: new Date('2024-11-29T10:15:00')
    }
  ]);
}
