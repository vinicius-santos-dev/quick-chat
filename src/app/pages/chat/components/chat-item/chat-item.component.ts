import { Component, Input } from '@angular/core';
import { ChatItem } from '../../interfaces/chat-item.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.scss',
})
export class ChatItemComponent {
  @Input({ required: true }) chat!: ChatItem;
}
