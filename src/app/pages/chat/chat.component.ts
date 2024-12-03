import {
  Component,
  computed,
  effect,
  inject,
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
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit {
  private authStore = inject(useAuthStore);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  protected readonly chats = signal<ChatItem[]>([
    {
      id: '1',
      displayName: 'John Doe',
      photoURL: 'assets/default-avatar.png',
      lastMessage: 'Hey, how are you?',
      timestamp: new Date('2024-12-02T14:30:00'),
    },
    {
      id: '2',
      displayName: 'Jane Smith',
      photoURL: 'assets/default-avatar.png',
      lastMessage: 'Can we meet tomorrow?',
      timestamp: new Date('2024-12-01T13:45:00'),
    },
    {
      id: '3',
      displayName: 'Lily Johnson',
      photoURL: 'assets/default-avatar.png',
      lastMessage: 'Thanks for your help!',
      timestamp: new Date('2024-11-29T10:15:00'),
    },
  ]);
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

  public onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  public onEditProfile(): void {
    this.router.navigate(['/profile']);
  }
}
