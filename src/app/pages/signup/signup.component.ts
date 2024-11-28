import { Component, inject, signal } from '@angular/core';
import { useAuthStore } from '../../stores/auth.store';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { AuthLayoutComponent } from '../../../shared/components';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, AuthLayoutComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private authStore = inject(useAuthStore);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private errorSub?: Subscription;

  public signupForm = this.formBuilder.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  public async onSubmit(): Promise<void> {
    try {
      this.isLoading.set(true);

      const { displayName, email, password } = this.signupForm.value;

      if (!displayName || !email || !password) return;

      await this.authStore.signUp(email, password, displayName);
      this.router.navigate(['/chat']);
      console.log('Signup successful!', this.authStore.currentUser());
    } catch (error) {
      console.error('Signup error:', error);
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
