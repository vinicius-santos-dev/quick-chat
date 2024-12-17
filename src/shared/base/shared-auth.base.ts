import { inject, signal } from '@angular/core';
import { useAuthStore } from '../../app/stores/auth.store';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { ToastService } from '../services';

/**
 * Auth Form Base Class
 * 
 * Abstract base class for authentication forms (login/register):
 * - Provides common dependencies injection
 * - Shares common form functionality
 * 
 * Extended by:
 * - LoginComponent
 * - RegisterComponent
 * - ProfileComponent
 */
@Injectable()
export abstract class AuthFormBase {
  /** Common dependencies for auth forms */
  protected authStore = inject(useAuthStore);
  protected router = inject(Router);
  protected formBuilder = inject(FormBuilder);
  protected toastService = inject(ToastService);

  /** Tracks form submission state */
  public formSubmitting = signal<boolean>(false);
}
