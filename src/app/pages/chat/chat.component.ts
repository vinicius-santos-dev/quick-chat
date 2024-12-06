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
import { BreakpointsService, PageContainerComponent, SearchInputComponent } from '../../../shared';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatItem } from './interfaces/chat-item.interface';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
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
  private breakpointsService = inject(BreakpointsService);

  protected readonly currentUser = computed(() => this.authStore.currentUser());

  //TODO: change participantNames
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

  protected readonly isChatSelected = signal<boolean>(false);

  protected readonly isMobile = this.breakpointsService.isMobile;

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

  public onChatSelected(chatId: string): void {
    this.router.navigate(['/chat', chatId]);
    this.isChatSelected.set(true);
  }
}
