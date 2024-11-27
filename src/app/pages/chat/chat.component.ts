import { Component, inject } from '@angular/core';
import { useAuthStore } from '../../stores/auth.store';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  private authStore = inject(useAuthStore);
  private router = inject(Router);
  
  public onLogout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
