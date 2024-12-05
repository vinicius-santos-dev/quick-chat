import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { useAuthStore } from '../../stores/auth.store';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PageContainerComponent, SearchInputComponent } from '../../../shared';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatItem } from './interfaces/chat-item.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LoadingButtonComponent } from '../../../shared/components/loading-button/loading-button.component';
import { NewChatModalComponent } from './modals/new-chat-modal/new-chat-modal.component';
import { useChatStore } from '../../stores/chat.store';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MenuModule,
    ReactiveFormsModule,
    RouterModule,
    PageContainerComponent,
    ChatListComponent,
    SearchInputComponent,
    LoadingButtonComponent,
    NewChatModalComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  private authStore = inject(useAuthStore);
  private chatStore = inject(useChatStore);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private unsubscribe: (() => void) | null = null;

  protected readonly currentUser = computed(() => this.authStore.currentUser());

  // protected readonly chats = signal<ChatItem[]>([
  //   // {
  //   //   id: '1',
  //   //   displayName: 'John Doe',
  //   //   photoURL: 'assets/default-avatar.png',
  //   //   lastMessage: 'Hey, how are you?',
  //   //   timestamp: new Date('2024-12-02T14:30:00'),
  //   // },
  //   // {
  //   //   id: '2',
  //   //   displayName: 'Jane Smith',
  //   //   photoURL: 'assets/default-avatar.png',
  //   //   lastMessage: 'Can we meet tomorrow?',
  //   //   timestamp: new Date('2024-12-01T13:45:00'),
  //   // },
  //   // {
  //   //   id: '3',
  //   //   displayName: 'Lily Johnson',
  //   //   photoURL: 'assets/default-avatar.png',
  //   //   lastMessage: 'Thanks for your help!',
  //   //   timestamp: new Date('2024-11-29T10:15:00'),
  //   // },
  // ]);

  protected readonly chats = computed<ChatItem[]>(() => {
    return this.chatStore.chats().map((chat) => ({
      id: chat.id,
      displayName:
        chat.participantNames?.find(
          (name) => name !== this.currentUser()?.displayName
        ) || 'Unknown User',
      photoURL: 'assets/default-avatar.png',
      lastMessage: chat.lastMessage,
      timestamp: chat.lastMessageTimestamp.toDate(),
    }));
  });

  protected readonly filteredChats = computed(() => {
    const term = this.searchTerm().toLowerCase();

    if (!term) return this.chats();

    return this.chats().filter((chat) =>
      chat.displayName.toLowerCase().includes(term)
    );
  });
  protected readonly searchTerm = signal<string>('');

  public searchForm = this.formBuilder.group({
    search: [''],
  });

  public ngOnInit(): void {
    this.searchForm
      .get('search')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchTerm.set(value || '');
      });

    // Subscribe to chats
    if (this.currentUser()) {
      const unsubscribe = this.chatStore.listenToChats(this.currentUser()!.uid);
      // Cleaner: Register cleanup directly
      this.destroyRef.onDestroy(unsubscribe);
    }
  }

  public menuItems: MenuItem[] = [
    {
      label: 'Edit Profile',
      icon: 'uil uil-edit',
      command: () => this.onEditProfile(),
    },
    {
      label: 'Logout',
      icon: 'uil uil-signout',
      command: () => this.onLogout(),
    },
  ];

  public async onLogout(): Promise<void> {
    try {
      await this.authStore.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  public onEditProfile(): void {
    this.router.navigate(['/profile']);
  }
}
