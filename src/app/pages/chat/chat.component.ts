import { Component, computed, effect, inject } from '@angular/core';
import { useAuthStore } from '../../stores/auth.store';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PageContainerComponent } from '../../../shared';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterModule, MenuModule, PageContainerComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  private authStore = inject(useAuthStore);
  private router = inject(Router);

  // TODO: Maybe this should be in app.component.ts (pages are flickering)
  protected readonly user = computed(() => this.authStore.currentUser());
  protected readonly isLoading = computed(() => this.authStore.isLoading());

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
      command: () => this.onEditProfile()
    },
    {
      label: 'Logout',
      icon: 'uil uil-signout',
      command: () => this.onLogout()
    }
  ]
  
  public onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  public onEditProfile(): void {
    this.router.navigate(['/profile']);
  }
    
}
