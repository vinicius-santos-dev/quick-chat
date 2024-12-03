import { inject, signal } from '@angular/core';
import { useAuthStore } from '../../app/stores/auth.store';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { ToastService } from '../services';

@Injectable()
export abstract class AuthFormBase {
  protected authStore = inject(useAuthStore);
  protected router = inject(Router);
  protected formBuilder = inject(FormBuilder);
  protected toastService = inject(ToastService);

  public formSubmitting = signal<boolean>(false);
}
