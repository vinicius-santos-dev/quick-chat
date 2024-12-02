import { Component, inject, Input } from '@angular/core';
import { ControlContainer, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule],
    viewProviders: [
      {
        provide: ControlContainer,
        useExisting: FormGroupDirective
      }
    ],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  @Input({ required: true }) public controlName!: string;
  @Input() public placeholder = 'Search...';

  private formGroupDirective = inject(FormGroupDirective);

  public get formGroup(): FormGroup {
    return this.formGroupDirective.form;
  }

  public get control() {
    return this.formGroup.get(this.controlName);
  }
}
