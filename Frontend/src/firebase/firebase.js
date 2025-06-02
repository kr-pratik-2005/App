// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // if you plan to use Firestore
import { getStorage } from "firebase/storage"; // if you plan to upload media files
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLmXDLyL3TUc1Gb3y1XKglAUzYXXfT25E",
  authDomain: "centeradminapp.firebaseapp.com",
  projectId: "centeradminapp",
  storageBucket: "centeradminapp.firebasestorage.app",
  messagingSenderId: "703941171715",
  appId: "1:703941171715:web:e4a1e5c30a149b6f594c36",
  measurementId: "G-P0LRHQJCVS"
};
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);