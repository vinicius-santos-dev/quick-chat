import { Component, computed } from '@angular/core';
import {
  AuthFormBase,
  FormInputComponent,
  ButtonComponent,
  PageContainerComponent,
} from '../../../shared';
import { AppUser } from '../../stores/auth.store';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

/**
 * Profile Component
 * 
 * Handles user profile management:
 * - Extends AuthFormBase for auth functionality
 * - Manages profile image uploads
 * - Updates user profile information
 * - Provides profile form with validation
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    PageContainerComponent,
    ReactiveFormsModule,
    FormInputComponent,
    ButtonComponent,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent extends AuthFormBase {
  protected readonly currentUser = computed(() => this.authStore.currentUser());

  public selectedFile: File | null = null;
  public imagePreview: string | null = null;

  public profileForm = this.formBuilder.group({
    displayName: ['', Validators.required],
    bio: [''],
  });

  constructor() {
    super();

    if (this.currentUser()) {
      this.setProfile(this.currentUser()!);
    }
  }

  /**
   * Handles profile form submission
   * - Validates form and user state
   * - Updates profile info in Firestore
   * - Handles image upload if new image selected
   * - Shows success/error toast messages
   */
  public async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || !this.currentUser()) return;

    try {
      this.formSubmitting.set(true);

      await this.authStore.updateProfile(
        this.currentUser()!.uid,
        {
          displayName: this.profileForm.value.displayName!,
          bio: this.profileForm.value.bio!,
        },
        this.selectedFile || undefined
      );

      this.toastService.success('Profile updated successfully');
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

  /**
   * Handles profile image selection
   * - Updates selectedFile state
   * - Creates base64 preview of selected image
   * - Uses FileReader for image preview generation
   */
  public onFileSelected(event: Event): void {
    // Cast event.target to HTMLInputElement to access files property
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    this.selectedFile = file;

    // FileReader creates base64 string from file
    const reader = new FileReader();

    // Called when readAsDataURL completes
    reader.onload = () => {
      // reader.result contains base64 string like:
      // "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      this.imagePreview = reader.result as string;
    };

    // Start reading file - triggers onload when done
    reader.readAsDataURL(file);
  }

  /**
   * Initializes profile form with user data
   * - Sets display name and bio from AppUser
   * - Used when component loads or user data updates
   */
  private setProfile(user: AppUser): void {
    this.profileForm.patchValue({
      displayName: user.displayName,
      bio: user.bio,
    });
  }
}
