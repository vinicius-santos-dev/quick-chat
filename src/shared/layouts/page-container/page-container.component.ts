import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
} from '@angular/core';
import { BreakpointsService } from '../../services';

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
export class PageContainerComponent  {
  @Input({ required: true }) public pageType!: 'profile' | 'chat';

  private breakpointsService = inject(BreakpointsService);
  protected readonly isMobile = this.breakpointsService.isMobile;

  public getContainerSize(): { width: string; height: string } {
    const { mobile, desktop } = CONTAINER_SIZES[this.pageType];
    const size = this.isMobile() ? mobile : desktop;

    return {
      width: `${size.width}vw`,
      height: `${size.height}vh`,
    };
  }
}
