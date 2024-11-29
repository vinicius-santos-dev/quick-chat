import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
})
export class PageContainerComponent {
  @Input({ required: true }) public height!: string;
  @Input({ required: true }) public width!: string;
}
