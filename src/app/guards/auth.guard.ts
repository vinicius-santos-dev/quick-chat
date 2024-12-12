import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { useAuthStore } from '../stores/auth.store';
import { filter, map, Observable, take } from 'rxjs';

export const authGuard = (requireAuth: boolean = true): CanActivateFn => {
  return (): Observable<boolean> => {
    const authStore = inject(useAuthStore);
    const router = inject(Router);

    return toObservable(authStore.authStateLoading).pipe(
      filter((loading) => !loading),
      take(1),
      map(() => {
        const user = authStore.currentUser();

        if (requireAuth && !user) {
          router.navigate(['/login']);
          return false;
        }

        if (!requireAuth && user) {
          router.navigate(['/chat']);
          return false;
        }

        return true;
      })
    );
  };
};
