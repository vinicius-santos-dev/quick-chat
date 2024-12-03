import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';

export interface ContainerSize {
  mobile: { width: string; height: string };
  desktop: { width: string; height: string };
}

export const CONTAINER_SIZES: Record<string, ContainerSize> = {
  profile: {
    mobile: { width: '100', height: '100' },
    desktop: { width: '25', height: '60' },
  },
  chat: {
    mobile: { width: '100', height: '100' },
    desktop: { width: '75', height: '85' },
  },
};

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
})
export class PageContainerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) public pageType!: 'profile' | 'chat';

  private platformId = inject(PLATFORM_ID);
  private isMobile = false;

  private checkIsMobile(): boolean {
    return isPlatformBrowser(this.platformId) ? window.innerWidth < 768 : false;
  }

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = this.checkIsMobile();

      window.addEventListener('resize', () => {
        this.isMobile = this.checkIsMobile();
      });
    }
  }

  public getContainerSize(): { width: string; height: string } {
    const { mobile, desktop } = CONTAINER_SIZES[this.pageType];
    const size = this.isMobile ? mobile : desktop;

    return {
      width: `${size.width}vw`,
      height: `${size.height}vh`,
    };
  }

  public ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', () => {
        this.isMobile = window.innerWidth < 768;
      });
    }
  }
}
