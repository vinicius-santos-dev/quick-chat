import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { FormInputComponent } from '../../../../../shared/components/form-input/form-input.component';
import { LoadingButtonComponent } from '../../../../../shared/components/loading-button/loading-button.component';
import { useChatStore } from '../../../../stores/chat.store';
import { Router } from '@angular/router';
import { ToastService } from '../../../../../shared';

@Component({
  selector: 'app-new-chat-modal',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    FormInputComponent,
    LoadingButtonComponent,
  ],
  templateUrl: './new-chat-modal.component.html',
  styleUrl: './new-chat-modal.component.scss',
})
export class NewChatModalComponent {
  private chatStore = inject(useChatStore);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private toastService = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly visible = signal(false);

  public chatForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  public async onSubmit(): Promise<void> {
    if (this.chatForm.invalid) return;

    this.loading.set(true);

    try {
      const email = this.chatForm.value.email!;
      const chatId = await this.chatStore.createNewChat(email);
      this.visible.set(false);
      // this.router.navigate(['/chat', chatId]);
      this.toastService.success(
        `Chat created successfully! Chat ID: ${chatId}`
      );
    } catch (error) {
      console.error('New chat error: ', error);
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      this.toastService.error(message);
    } finally {
      this.loading.set(false);
    }
  }

  public show(): void {
    this.visible.set(true);
    this.chatForm.reset();
  }
}
