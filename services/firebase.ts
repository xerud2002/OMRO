// ========================================
// ✅ utils/firebase.ts
// Compatibil Firebase SDK v12+
// Include: Auth, Firestore, Storage, Login/Register/Logout
// ========================================

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  serverTimestamp,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ========================================
// 🔧 Configurația Firebase din .env.local
// ========================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// ========================================
// 🚀 Initialize Firebase App
// ========================================
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ========================================
// 🔐 Auth, Firestore, Storage
// ========================================
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ========================================
// 🧩 Auth Helpers (login, register, logout)
// ========================================

// 🟢 Înregistrare utilizator nou (email/parolă)
export async function registerWithEmail(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// 🟣 Login utilizator existent (email/parolă)
export async function loginWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// 🔵 Login cu Google (creează cont automat dacă nu există)
export async function loginWithGoogle(role: string = "customer") {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Creează / actualizează profilul în Firestore
  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      name: user.displayName || "",
      userId: user.uid,
      role,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return result;
}

// 🟠 Resetare parolă
export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

// 🔴 Logout
export async function logout() {
  try {
    await signOut(auth);
    console.log("👋 Utilizator delogat cu succes.");
  } catch (error) {
    console.error("❌ Eroare la delogare:", error);
  }
}

// 🟣 Ascultă modificările de autentificare
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ========================================
// ⏰ Shortcut pentru timestamp server
// ========================================
export const serverTime = serverTimestamp;

// ========================================
// 📦 Exporturi Firestore (utile în alte fișiere)
// ========================================
export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
};

// ========================================
// ✅ Export implicit
// ========================================
export default app;
