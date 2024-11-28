import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss'
})
export class LoadingButtonComponent {
  @Input() public loading = false;
  @Input() public disabled = false;
}
