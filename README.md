# QuickChat 💬

A real-time chat application built with Angular 17, Firebase, and Supabase. <br />
Features a modern UI with responsive design and secure authentication.

<img src="https://github.com/user-attachments/assets/b076e84b-f473-41d4-a6c9-3f49b1b1b422" alt="quick-chat">

## ✨ Key Features

- 🔐 Secure authentication with Firebase
- 💬 Real-time messaging
- 📸 Image sharing in chats
- 👥 User profile management
- 👤 User profiles with avatars
- 🔍 User search functionality
- 🔔 Toast notifications
- 📱 Fully responsive design

## 🛠️ Technical Stack

### Frontend

- Angular 17
- PrimeNG
- TailwindCSS

### State Management & Reactivity

- Angular Signals
- RxJS

### Backend & Services

- Firebase Authentication
- Firebase Firestore
- Supabase Storage

### Infrastructure

- Vercel (Hosting & Analytics)

## 🚀 Getting Started

1. Clone the repository:

```
git clone https://github.com/vinicius-santos-dev/quick-chat.git
```

2. Install dependencies:

```
npm install
```

3. Configure environment variables:

```
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'your-api-key',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id',
  },
  supabase: {
    url: 'your-supabase-url',
    publicKey: 'your-supabase-public-key',
  },
};
```

4. Start the development server:

```
npm start
```

## 🎯 Project Structure

```
src/
├── app/
│   ├── guards/     # Route guards
│   ├── pages/         # Page components
│   ├── stores/        # State management
├── assets/           # Static files
└── environments/     # Environment configs
└── shared/     # Shared components/pipes/services
```

## 🔗 Live Demo

Check out the live demo: [QuickChat](https://viniciusdev-quick-chat.vercel.app)

## 📫 Contact

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vinicius-santos-dev)
[![Portfolio](https://img.shields.io/badge/Portfolio-470FA3?style=for-the-badge&logo=About.me&logoColor=white)](https://www.viniciussantos.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://api.whatsapp.com/send?phone=5511984375850)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:vinicius.ssantos.dev@gmail.com)