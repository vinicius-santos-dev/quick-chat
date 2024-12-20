import {
  AfterViewChecked,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { useChatStore } from '../../../../stores/chat.store';
import { useAuthStore } from '../../../../stores/auth.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointsService, ToastService } from '../../../../../shared';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Chat Detail Component
 * 
 * Displays and manages active chat conversation:
 * - Shows message history
 * - Handles message sending (text & images)
 * - Manages chat view scroll position
 * - Supports responsive mobile/desktop layouts
 */
@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [RouterModule, ButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.scss',
})
export class ChatDetailComponent implements AfterViewChecked {
  /** Reference to messages container for scroll management */
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  private previousMessagesLength = 0;

  private chatStore = inject(useChatStore);
  private authStore = inject(useAuthStore);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  protected readonly isMobile = inject(BreakpointsService).isMobile;
  protected readonly chatId = signal<string>('');
  protected toastService = inject(ToastService);

  protected readonly currentUser = computed(() => this.authStore.currentUser());
  protected readonly messages = computed(() => this.chatStore.messages());

  private readonly DEFAULT_USER = {
    name: 'Unknown User',
    photoURL: 'assets/default-avatar.png',
    bio: 'No bio available',
  } as const;

  /**
   * Gets other participant's info in current chat
   * 
   * Flow:
   * 1. Get current chat and user
   * 2. Find participant that isn't current user
   * 3. Return participant info or default values
   * 
   * Returns object with:
   * - name: Display name of other participant
   * - photoURL: Profile image URL
   * - bio: User bio
   */
  protected readonly otherParticipant = computed(() => {
    const currentChat = this.chatStore.currentChat();
    const currentUser = this.authStore.currentUser();

    if (!currentChat || !currentUser) return this.DEFAULT_USER;

    // Get other participant's index using find
    const otherParticipantIndex =
      currentChat.participantNames?.findIndex(
        (name) => name !== currentUser.displayName
      ) ?? -1;

    if (otherParticipantIndex === -1) return this.DEFAULT_USER;

    return {
      name:
        currentChat.participantNames?.[otherParticipantIndex] ||
        this.DEFAULT_USER.name,
      photoURL:
        currentChat.participantPhotos?.[otherParticipantIndex] ||
        this.DEFAULT_USER.photoURL,
      bio:
        currentChat.participantBios?.[otherParticipantIndex] ||
        this.DEFAULT_USER.bio,
    };
  });

  public chatDetailForm = this.formBuilder.group({
    message: ['', [Validators.required]],
  });

  constructor() {
    // Subscribe to route params with automatic cleanup
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const chatId = params['chatId'];
        if (chatId) {
          this.chatId.set(chatId);
          this.chatStore.listenToMessages(chatId);
        }
      });
  }

  public ngAfterViewChecked(): void {
    // Only scroll if messages length changed
    if (this.messages().length !== this.previousMessagesLength) {
      this.previousMessagesLength = this.messages().length;
      this.scrollToBottom();
    }
  }

  public ngOnChanges(): void {
    this.scrollToBottom();
  }

  public onBack(): void {
    this.router.navigate(['/chat']);
  }

  public onSubmit(): void {
    if (this.chatDetailForm.invalid || !this.currentUser()) return;

    const chatId = this.chatId();
    const senderId = this.currentUser()!.uid;
    const message = this.chatDetailForm.get('message')?.value || '';

    this.chatStore.sendMessage(chatId, senderId, message);

    this.chatDetailForm.reset();
  }

  public async onImageSelected(event: any): Promise<void> {
    const file = event.target.files?.[0];
    
    if (!file || !this.currentUser()) return;

    try {
      await this.chatStore.sendImageMessage(
        this.chatId(),
        this.currentUser()!.uid,
        file
      );
    } catch (error) {
      console.error('Error uploading image:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      this.toastService.error(message);
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    } catch (error) {
      console.error('Scroll error:', error);
    }
  }
}
