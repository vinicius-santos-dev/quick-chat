import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthFooterComponent,
  AuthFormBase,
  AuthHeaderComponent,
  AuthLayoutComponent,
  FormInputComponent,
  LoadingButtonComponent,
} from '../../../shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FormInputComponent,
    LoadingButtonComponent,
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
