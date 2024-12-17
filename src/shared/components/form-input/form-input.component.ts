import { Component, inject, Input } from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';

/**
 * Form Input Component
 * 
 * Reusable form input wrapper that integrates with Angular Reactive Forms:
 * - Provides consistent input styling and behavior
 * - Handles form control binding automatically
 * - Supports different input types (text, password, etc)
 * 
 * Usage:
 * <app-form-input
 *   label="Email"
 *   type="email"
 *   controlName="email"
 * ></app-form-input>
 */
@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
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
      useExisting: FormGroupDirective,
    },
  ],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss',
})
export class FormInputComponent {
  @Input() public label!: string;
  @Input() public type: string = 'text';
  @Input() public controlName!: string;

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
