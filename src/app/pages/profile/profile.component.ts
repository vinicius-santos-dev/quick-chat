import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import { AuthFormBase, FormInputComponent, LoadingButtonComponent, PageContainerComponent } from '../../../shared';
import { AppUser, useAuthStore } from '../../stores/auth.store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PageContainerComponent, ReactiveFormsModule, FormInputComponent, LoadingButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent extends AuthFormBase {
  protected readonly user = computed(() => this.authStore.currentUser());
  public profileForm = this.formBuilder.group({
    displayName: ['', Validators.required],
    bio: [''],
  });
  public currentUser: AppUser | null = null;
  // protected readonly isLoading = computed(() => this.authStore.isLoading());

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
      this.isLoading.set(true);

      await this.authStore.updateProfile(this.currentUser.uid, {
        displayName: this.profileForm.value.displayName!,
        bio: this.profileForm.value.bio!,
      })

      this.router.navigate(['/chat']);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private setProfile(user: AppUser): void {
    this.profileForm.patchValue({
      displayName: user.displayName,
      bio: user.bio,
    });
  }
}
