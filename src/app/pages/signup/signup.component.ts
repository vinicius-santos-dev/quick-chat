import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthFooterComponent,
  AuthHeaderComponent,
  AuthLayoutComponent,
  FormInputComponent,
  ButtonComponent,
} from '../../../shared/components';
import { AuthFormBase } from '../../../shared';

/**
 * Signup Component
 * 
 * Handles new user registration:
 * - Extends AuthFormBase for common auth functionality
 * - Validates user input
 * - Manages signup process with Firebase
 * - Handles error states and success navigation
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FormInputComponent,
    ButtonComponent,
    AuthFooterComponent,
    AuthHeaderComponent
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent extends AuthFormBase {

  public signupForm = this.formBuilder.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });


  /**
   * Handles form submission:
   * - Creates new user account
   * - Redirects to profile page on success
   * - Shows error toast on failure
   */
  public async onSubmit(): Promise<void> {
    try {
      this.formSubmitting.set(true);

      const { displayName, email, password } = this.signupForm.value;

      if (!displayName || !email || !password) return;

      await this.authStore.signUp(email, password, displayName);
      this.router.navigate(['/profile']);
      console.log('Signup successful!', this.authStore.currentUser());
    } catch (error) {
      console.error('Signup error:', error);
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
