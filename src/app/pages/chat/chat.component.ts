import { Component, computed, effect, inject } from '@angular/core';
import { useAuthStore } from '../../stores/auth.store';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PageContainerComponent } from '../../../shared';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChatListComponent } from './components/chat-list/chat-list.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    MenuModule,
    ReactiveFormsModule,
    RouterModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PageContainerComponent,
    ChatListComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private authStore = inject(useAuthStore);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  // TODO: Maybe this should be in app.component.ts (pages are flickering)
  protected readonly user = computed(() => this.authStore.currentUser());
  protected readonly isLoading = computed(() => this.authStore.isLoading());

  public searchForm = this.formBuilder.group({
    search: [''],
  });

  constructor() {
    effect(() => {
      if (!this.isLoading() && !this.user()) {
        this.router.navigate(['/login']);
      }
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
