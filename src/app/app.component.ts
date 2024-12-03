import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { useAuthStore } from './stores/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private authStore = inject(useAuthStore);

  protected readonly user = computed(() => this.authStore.currentUser());
  protected readonly isInitialized = computed(() => this.authStore.isInitialized());
}
