import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './auth-footer.component.html',
  styleUrl: './auth-footer.component.scss'
})
export class AuthFooterComponent {
  @Input() public title!: string;
  @Input() public link!: string;
  @Input() public linkText!: string;
}
