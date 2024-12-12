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
import { supabase } from '../../shared';

export interface Chat {
  id: string;
  participants: string[];
  participantNames?: string[];
  participantPhotos?: string[];
  participantBios?: string[];
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  imageUrl?: string;
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

  async function getUserInfo(userId: string): Promise<{
    name: string;
    photoURL: string;
    bio: string;
  }> {
    const userDoc = await getDoc(doc(firestore, `users/${userId}`));
    if (userDoc.exists()) {
      const userData = userDoc.data() as AppUser;
      return {
        name: userData.displayName || userData.email || 'Unknown User',
        photoURL: userData.photoURL || 'assets/default-avatar.png',
        bio: userData.bio || '',
      };
    }
    return {
      name: 'Unknown User',
      photoURL: 'assets/default-avatar.png',
      bio: '',
    };
  }

  async function fetchParticipantInfo(participantIds: string[]): Promise<{
    names: string[];
    photos: string[];
    bios: string[];
  }> {
    const participantInfo = await Promise.all(participantIds.map(getUserInfo));
    return {
      names: participantInfo.map((info) => info.name),
      photos: participantInfo.map((info) => info.photoURL),
      bios: participantInfo.map((info) => info.bio),
    };
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
          const info = await fetchParticipantInfo(chatData.participants);
          chatData.participantNames = info.names;
          chatData.participantPhotos = info.photos;
          chatData.participantBios = info.bios;
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
      lastMessageTimestamp: newMessage.timestamp,
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

  async function uploadChatImage(file: File, chatId: string): Promise<string> {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed.');
      }
    }

    const fileName = `${chatId}/${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('chat-images').getPublicUrl(fileName);

    return publicUrl;
  }

  async function sendImageMessage(chatId: string, senderId: string, file: File) {
    const imageUrl = await uploadChatImage(file, chatId);
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    
    const newMessage = {
      chatId,
      senderId,
      imageUrl,
      text: '📷 Image',
      timestamp: Timestamp.now(),
    };

    await addDoc(messagesRef, newMessage);

    // Update the last message in the chat document
    const chatRef = doc(firestore, `chats/${chatId}`);
    await updateDoc(chatRef, {
      lastMessage: newMessage.text,
      lastMessageTimestamp: newMessage.timestamp,
    });
  }

  return {
    chats,
    currentChat,
    messages,
    listenToChats,
    listenToMessages,
    sendMessage,
    createNewChat,
    getUserInfo,
    sendImageMessage,
    uploadChatImage
  };
});
