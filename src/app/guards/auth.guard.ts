import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { useAuthStore } from '../stores/auth.store';
import { filter, map, Observable, take } from 'rxjs';


/**
 * Authentication guard to protect routes based on user authentication state.
 * - Protect private routes from unauthenticated access
 * - Prevent authenticated users from accessing auth pages (login/register)
 */
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
