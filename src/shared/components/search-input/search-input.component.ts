import { Component, inject, Input } from '@angular/core';
import { ControlContainer, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Search Input Component
 * 
 * Reusable search input that integrates with Angular Reactive Forms:
 * - Provides styled search input with icon
 * - Handles form control binding
 * - Uses PrimeNG input components
 * 
 * Usage:
 * <app-search-input
 *   controlName="search"
 *   placeholder="Search users..."
 * ></app-search-input>
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule],
  /**
   * ViewProviders Configuration
   * 
   * Allows this component to access parent form's FormGroupDirective
   * Required for nested form components to work with reactive forms
   * ControlContainer enables form control inheritance from parent
   */
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

  /** Access to parent form group */
  public get formGroup(): FormGroup {
    return this.formGroupDirective.form;
  }

  /** Access to this component's form control */
  public get control() {
    return this.formGroup.get(this.controlName);
  }
}
