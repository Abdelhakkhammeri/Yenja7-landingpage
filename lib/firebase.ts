// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAAM0DQJ3WcCV9jZ5T8iIob3WxevZx8-UA",
  authDomain: "test-b94ba.firebaseapp.com",
  projectId: "test-b94ba",
  storageBucket: "test-b94ba.firebasestorage.app",
  messagingSenderId: "270212586054",
  appId: "1:270212586054:web:a420b343f6a84467aa0847",
  measurementId: "G-G528DCLTHM"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
