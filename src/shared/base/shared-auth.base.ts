import { inject, OnDestroy, signal } from '@angular/core';
import { useAuthStore } from '../../app/stores/auth.store';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class AuthFormBase implements OnDestroy {
  protected authStore = inject(useAuthStore);
  protected router = inject(Router);
  protected formBuilder = inject(FormBuilder);
  protected errorSub?: Subscription;

  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);

  protected showErrorWithTimeout(message: string): void {
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
