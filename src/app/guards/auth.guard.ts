import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { useAuthStore } from '../stores/auth.store';
import { filter, map, Observable, take, tap } from 'rxjs';

export const authGuard = (requireAuth: boolean = true): CanActivateFn => {
  return (): Observable<boolean> => {
    const authStore = inject(useAuthStore);
    const router = inject(Router);

    console.log('[Auth Guard] Initial check - Loading:', authStore.authStateLoading(), 'User:', authStore.currentUser());

    return toObservable(authStore.authStateLoading).pipe(
      tap(loading => console.log('[Auth Guard] Loading state changed:', loading)),
      filter(loading => !loading),
      tap(() => console.log('[Auth Guard] Loading completed')),
      take(1),
      map(() => {
        const user = authStore.currentUser();
        console.log('[Auth Guard] Making navigation decision - User:', user, 'RequireAuth:', requireAuth);

        if (requireAuth && !user) {
          console.log('[Auth Guard] Redirecting to login');
          router.navigate(['/login']);
          return false;
        }

        if (!requireAuth && user) {
          console.log('[Auth Guard] Redirecting to chat');
          router.navigate(['/chat']);
          return false;
        }

        console.log('[Auth Guard] Allowing navigation');
        return true;
      })
    );
  };
};
