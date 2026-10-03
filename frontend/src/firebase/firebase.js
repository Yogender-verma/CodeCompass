import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

// Read Firebase environment variables loaded from root .env by Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Check if credentials are properly configured (not empty and not placeholders)
export const isFirebaseConfigured = () => {
  const apiKey = firebaseConfig.apiKey;
  return Boolean(
    apiKey &&
    !apiKey.includes("Placeholder") &&
    !apiKey.includes("your_firebase") &&
    apiKey.length > 10
  );
};

// Initialize Firebase safely
let app;
let auth;
let googleProvider;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
  
  // Set local persistence so user session survives browser refresh
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Could not set local persistence:", err);
  });
} catch (error) {
  console.warn("Firebase initialization warning:", error.message);
}

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  firebaseSignOut,
  onAuthStateChanged,
  firebaseConfig,
};
