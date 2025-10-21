import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Router from "next/router";

// ✅ Only initialize if window or build-time safe environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// ✅ Initialize safely (avoid multiple apps and null refs)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Providers
const googleProvider = new GoogleAuthProvider();

// Email + Password
export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Google login
export const loginWithGoogle = async (roleHint?: "company" | "customer") => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      userId: user.uid, // 👈 Required for Firestore rules
      email: user.email,
      name: user.displayName || "",
      role: roleHint || "customer",
      createdAt: new Date(),
    });
  } else {
    // ✅ Auto-add userId field if it was missing from old users
    const data = snap.data();
    if (!data.userId) {
      await setDoc(
        userRef,
        { userId: user.uid },
        { merge: true }
      );
    }
  }

  return result;
};



// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    Router.push("/");
  } catch (err) {
    console.error("Logout error:", err);
  }
};

// Auth state change
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);
