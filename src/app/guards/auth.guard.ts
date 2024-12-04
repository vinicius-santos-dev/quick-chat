import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { useAuthStore } from '../stores/auth.store';
import { combineLatest, filter, map, Observable, of, take, tap } from 'rxjs';

export const authGuard = (requireAuth: boolean = true): CanActivateFn => {
  return (): Observable<boolean> => {
    const authStore = inject(useAuthStore);
    const router = inject(Router);

    return combineLatest([
      toObservable(authStore.isInitialized),
      toObservable(authStore.authStateLoading),
    ]).pipe(
      filter(([initialized, loading]) => initialized && !loading),
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

// export const authGuard = (requireAuth: boolean = true): CanActivateFn => {
//   return (route, state): Observable<boolean> => {
//     const authStore = inject(useAuthStore);
//     const router = inject(Router);

//     console.log('Auth Guard Called:', {
//       requireAuth,
//       currentPath: router.url,
//       targetPath: state.url,
//       isInitialized: authStore.isInitialized(),
//       isLoading: authStore.authStateLoading(),
//       currentUser: authStore.currentUser()
//     });

//     // Skip guard check if still loading
//     if (authStore.authStateLoading()) {
//       return of(true);
//     }

//     return combineLatest([
//       toObservable(authStore.isInitialized),
//       toObservable(authStore.authStateLoading)
//     ]).pipe(
//       tap(([initialized, loading]) => {
//         console.log('Auth State:', { initialized, loading, targetUrl: state.url });
//       }),
//       filter(([initialized, loading]) => initialized && !loading),
//       take(1),
//       map(() => {
//         const user = authStore.currentUser();
//         console.log('Guard Decision:', {
//           user: !!user,
//           requireAuth,
//           targetUrl: state.url,
//           willNavigate: (requireAuth && !user) || (!requireAuth && user)
//         });

//         if (requireAuth && !user) {
//           router.navigate(['/login']);
//           return false;
//         }

//         if (!requireAuth && user) {
//           router.navigate(['/chat']);
//           return false;
//         }

//         return true;
//       })
//     );
//   };
// };
