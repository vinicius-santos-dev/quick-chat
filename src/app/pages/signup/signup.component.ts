import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthFooterComponent,
  AuthHeaderComponent,
  AuthLayoutComponent,
  FormInputComponent,
  LoadingButtonComponent,
} from '../../../shared/components';
import { AuthFormBase } from '../../../shared';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FormInputComponent,
    LoadingButtonComponent,
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

      this.toastService.error(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
