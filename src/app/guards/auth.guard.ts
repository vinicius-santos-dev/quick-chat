import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { useAuthStore } from "../stores/auth.store";

export const authGuard: CanActivateFn = async () => {
  const authStore = inject(useAuthStore);
  const router = inject(Router);

  if (!authStore.currentUser()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
}