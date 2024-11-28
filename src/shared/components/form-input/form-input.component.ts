import { Component, Input } from '@angular/core';
import { ControlContainer, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss'
})
export class FormInputComponent {
  @Input() public label!: string;
  @Input() public type: string = 'text';
  @Input() public controlName!: string;

  get control() {
    return this.formGroup.get(this.controlName);
  }

  constructor(private formGroupDirective: FormGroupDirective) {}

  get formGroup(): FormGroup {
    return this.formGroupDirective.form;
  }
}
