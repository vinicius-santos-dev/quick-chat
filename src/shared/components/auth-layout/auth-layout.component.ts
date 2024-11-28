import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  // title = signal<string>('');

  // @Input() set pageTitle(value: string) {
  //   this.title.set(value);
  // }
}
