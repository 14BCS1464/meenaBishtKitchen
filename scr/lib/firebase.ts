import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔥 Direct Firebase config (NO env variables)
const firebaseConfig = {
    apiKey: "AIzaSyDDGWSGxajNfkvQpM7BRtGzm1T5r9SQ7Ks",
    authDomain: "meenakitchen-1edc4.firebaseapp.com",
    projectId: "meenakitchen-1edc4",
    storageBucket: "meenakitchen-1edc4.firebasestorage.app",
    messagingSenderId: "118172957462",
    appId: "1:118172957462:web:d6f7299b9c4753c954ee37",
    measurementId: "G-N3V3W4P6T4",
};

// ✅ Prevent multiple initializations (VERY IMPORTANT for Next.js)
const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
