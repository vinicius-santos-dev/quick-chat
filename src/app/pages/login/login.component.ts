import { Component, inject, OnDestroy, signal } from '@angular/core';
import { useAuthStore } from '../../stores/auth.store';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { AuthLayoutComponent } from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, AuthLayoutComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  private authStore = inject(useAuthStore);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private errorSub?: Subscription;

  public loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  public async onSubmit(): Promise<void> {
    try {
      this.isLoading.set(true);

      const { email, password } = this.loginForm.value;

      if (!email || !password) return;

      await this.authStore.login(email, password);
      this.router.navigate(['/chat']);
    } catch (error) {
      console.error('Login error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      this.showErrorWithTimeout(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private showErrorWithTimeout(message: string): void {
    // Clear any existing subscription
    this.errorSub?.unsubscribe();

    this.errorMessage.set(message);

    this.errorSub = timer(5000).subscribe(() => {
      this.errorMessage.set(null);
    });
  }

  public ngOnDestroy(): void {
    this.errorSub?.unsubscribe();
  }
}
