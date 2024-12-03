import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { CanActivateFn, Router } from "@angular/router";
import { useAuthStore } from "../stores/auth.store";
import { filter, map, Observable, take } from "rxjs";

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const authStore = inject(useAuthStore);
  const router = inject(Router);

  return toObservable(authStore.isInitialized).pipe(
    filter(initialized => initialized),
    // filter(() => !authStore.authStateLoading()),
    take(1),
    map(() => {
      if (authStore.authStateLoading()) {
        return true;
      }

      const user = authStore.currentUser();
      if (!user) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};

export const publicGuard: CanActivateFn = (): Observable<boolean> => {
  const authStore = inject(useAuthStore);
  const router = inject(Router);

  return toObservable(authStore.isInitialized).pipe(
    filter(initialized => initialized),
    // filter(() => !authStore.authStateLoading()),
    take(1),
    map(() => {
      if (authStore.authStateLoading()) {
        return true;
      }

      const user = authStore.currentUser();
      if (user) {
        router.navigate(['/chat']);
        return false;
      }
      return true;
    })
  );
};