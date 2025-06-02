// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDO6frlK-h-RIWGfwobt_0xztBybE-QxBY",
  authDomain: "mimansa-local.firebaseapp.com",
  projectId: "mimansa-local",
  storageBucket: "mimansa-local.appspot.com", // fixed typo: should be .app**spot**.com
  messagingSenderId: "919618356755",
  appId: "1:919618356755:web:8e874c3bf7bf1cd19de1e6",
  measurementId: "G-G4MSZ4CDJP",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // optional

// ✅ Export what your app expects
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
