import { Component, computed, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { useChatStore } from '../../../../stores/chat.store';
import { useAuthStore } from '../../../../stores/auth.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [],
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.scss',
})
export class ChatDetailComponent {
  private chatStore = inject(useChatStore);
  private authStore = inject(useAuthStore);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private readonly DEFAULT_USER = {
    name: 'Unknown User',
    photoURL: 'assets/default-avatar.png',
    bio: 'No bio available',
  } as const;

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

  constructor() {
    // Subscribe to route params with automatic cleanup
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const chatId = params['chatId'];
        if (chatId) {
          this.chatStore.listenToMessages(chatId);
        }
      });
  }
}
