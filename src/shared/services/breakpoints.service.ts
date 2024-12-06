import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BreakpointsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mediaQuery: MediaQueryList | null = null;
  public readonly isMobile = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.mediaQuery = window.matchMedia('(max-width: 768px)');
      this.isMobile.set(this.mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => {
        this.isMobile.set(e.matches);
      };

      this.mediaQuery.addEventListener('change', handler);
      
      this.destroyRef.onDestroy(() => {
        this.mediaQuery?.removeEventListener('change', handler);
      });
    }
  }
}
