import {
  Component,
  computed,
  effect,
} from '@angular/core';
import {
  AuthFormBase,
  FormInputComponent,
  LoadingButtonComponent,
  PageContainerComponent,
} from '../../../shared';
import { AppUser } from '../../stores/auth.store';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    PageContainerComponent,
    ReactiveFormsModule,
    FormInputComponent,
    LoadingButtonComponent,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent extends AuthFormBase {

  protected readonly user = computed(() => this.authStore.currentUser());
  public profileForm = this.formBuilder.group({
    displayName: ['', Validators.required],
    bio: [''],
  });

  //TODO: Look if this is needed
  public currentUser: AppUser | null = null;

  constructor() {
    super();

    // Use effect to react to user changes
    effect(() => {
      this.currentUser = this.user();
      console.log('User in effect:', this.currentUser);

      if (this.currentUser) {
        this.setProfile(this.currentUser);
      }
    });
  }

  public async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.currentUser) return;

    try {
      this.formSubmitting.set(true);

      await this.authStore.updateProfile(this.currentUser.uid, {
        displayName: this.profileForm.value.displayName!,
        bio: this.profileForm.value.bio!,
      });

      this.toastService.success('Profile updated successfully');

      this.router.navigate(['/chat']);
    } catch (error) {
      console.error('Error updating profile:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      this.toastService.error(message);
    } finally {
      this.formSubmitting.set(false);
    }
  }

  private setProfile(user: AppUser): void {
    this.profileForm.patchValue({
      displayName: user.displayName,
      bio: user.bio,
    });
  }
}
