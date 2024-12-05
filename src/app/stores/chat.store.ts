import { createInjectable } from 'ngxtension/create-injectable';
import { inject, signal, computed, effect } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
} from '@angular/fire/firestore';
import { useAuthStore, AppUser } from './auth.store';

export interface Chat {
  id: string;
  participants: string[];
  participantNames?: string[];
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

export const useChatStore = createInjectable(() => {
  const firestore = inject(Firestore);
  const authStore = inject(useAuthStore);
  const chats = signal<Chat[]>([]);
  const currentChatId = signal<string | null>(null);
  const messages = signal<Message[]>([]);

  const currentChat = computed(() =>
    chats().find((chat) => chat.id === currentChatId())
  );

  effect(() => {
    const userId = authStore.currentUser()?.uid;
    if (userId) {
      listenToChats(userId);
    }
  });

  async function getUserName(userId: string): Promise<string> {
    const userDoc = await getDoc(doc(firestore, `users/${userId}`));
    if (userDoc.exists()) {
      const userData = userDoc.data() as AppUser;
      return userData.displayName || userData.email || 'Unknown User';
    }
    return 'Unknown User';
  }

  async function fetchParticipantNames(
    participantIds: string[]
  ): Promise<string[]> {
    const names = await Promise.all(participantIds.map(getUserName));
    return names;
  }

  function listenToChats(userId: string) {
    const chatsRef = collection(firestore, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    return onSnapshot(q, async (snapshot) => {
      const updatedChats = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = { id: doc.id, ...doc.data() } as Chat;
          chatData.participantNames = await fetchParticipantNames(
            chatData.participants
          );
          return chatData;
        })
      );
      chats.set(updatedChats);
    });
  }

  function listenToMessages(chatId: string) {
    currentChatId.set(chatId);
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Message)
      );
      messages.set(updatedMessages);
    });
  }

  async function sendMessage(chatId: string, senderId: string, text: string) {
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    const newMessage = {
      chatId,
      senderId,
      text,
      timestamp: Timestamp.now(),
    };
    await addDoc(messagesRef, newMessage);

    // Update the last message in the chat document
    const chatRef = doc(firestore, `chats/${chatId}`);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTimestamp: Timestamp.now(),
    });
  }

  async function createNewChat(participantEmail: string) {
    const currentUser = authStore.currentUser();
    if (!currentUser) throw new Error('You must be logged in to create a chat');

    // Find the user with the given email
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', participantEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const participantUser = querySnapshot.docs[0].data() as AppUser;

    // Don't allow chat with self
    if (currentUser.uid === participantUser.uid) {
      throw new Error('Cannot create chat with yourself');
    }

    // Get all chats for current user
    const chatsRef = collection(firestore, 'chats');
    const userChatsQuery = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.uid)
    );

    const userChatsSnapshot = await getDocs(userChatsQuery);

    // Check if a chat already exists between these users
    const existingChat = userChatsSnapshot.docs.find((doc) => {
      const chatData = doc.data() as Chat;
      return chatData.participants.includes(participantUser.uid);
    });

    if (existingChat) return existingChat.id;

    // Create a new chat document
    const newChat = await addDoc(chatsRef, {
      participants: [currentUser.uid, participantUser.uid],
      lastMessage: '',
      lastMessageTimestamp: Timestamp.now(),
    });

    return newChat.id;
  }

  return {
    chats,
    currentChat,
    messages,
    listenToChats,
    listenToMessages,
    sendMessage,
    createNewChat,
    getUserName,
  };
});
