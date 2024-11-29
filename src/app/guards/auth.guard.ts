import { computed, inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { useAuthStore } from "../stores/auth.store";


//TODO: Fix guard, it's not working properly
export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(useAuthStore);
  const router = inject(Router);

  // Debug logs
  console.log('Auth Guard - Initialized:', authStore.isInitialized());
  console.log('Auth Guard - Current User:', authStore.currentUser());

  if (!authStore.isInitialized()) {
    return true; // Allow navigation while initializing
  }

  if (!authStore.currentUser()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};