import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { firebaseConfig } from './firebase.config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Apple Auth Provider
const appleProvider = new OAuthProvider('apple.com');

// Messaging
let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
} catch {}

export { auth, googleProvider, appleProvider, signInWithPopup, signOut, onAuthStateChanged, messaging, getToken, onMessage, createUserWithEmailAndPassword, signInWithEmailAndPassword };
export type { User };