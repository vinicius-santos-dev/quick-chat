import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthFooterComponent,
  AuthFormBase,
  AuthHeaderComponent,
  AuthLayoutComponent,
  FormInputComponent,
  ButtonComponent,
} from '../../../shared';

/**
 * Login Component
 * 
 * Handles user authentication:
 * - Extends AuthFormBase for common auth functionality
 * - Validates user credentials
 * - Manages login process with Firebase
 * - Handles error states and success navigation
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FormInputComponent,
    ButtonComponent,
    AuthHeaderComponent,
    AuthFooterComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends AuthFormBase {

  public loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Handles form submission:
   * - Validates credentials with Firebase
   * - Redirects to chat on success
   * - Shows error toast on failure
   */
  public async onSubmit(): Promise<void> {
    try {
      this.formSubmitting.set(true);

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

      this.toastService.error(message);
    } finally {
      this.formSubmitting.set(false);
    }
  }
}
