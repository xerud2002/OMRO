// utils/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

/* ================================
 🔹 Firebase Configuration
================================ */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Prevent reinitialization in Next.js (hot reload safe)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔥 Initialize Core Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* ================================
 ⚙️ Optional Local Emulator (safe)
================================ */
if (process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true") {
  try {
    console.log("⚙️ Connecting to Firebase emulators...");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  } catch (e) {
    console.warn("Emulator connection failed (already connected?)", e);
  }
}

/* ================================
 🔐 AUTH HELPERS
================================ */
const provider = new GoogleAuthProvider();

// 🟢 Register with email/password
export async function registerWithEmail(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// 🟢 Login with email/password
export async function loginWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// 🟢 Login with Google (role: customer/company)
export async function loginWithGoogle(role: "customer" | "company" = "customer") {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || "",
      role,
      createdAt: serverTimestamp(),
    });
  } else {
    const existing = userSnap.data();
    if (!existing.role) {
      await setDoc(userRef, { role }, { merge: true });
    }
  }

  // 🏢 If company role, ensure company record exists
  if (role === "company") {
    const companyRef = doc(db, "companies", user.uid);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) {
      await setDoc(companyRef, {
        name: user.displayName || "",
        email: user.email,
        phone: "",
        city: "",
        county: "",
        verified: false,
        subscription: "free",
        services: [],
        createdAt: serverTimestamp(),
      });
    }
  }

  return result;
}

// 🟢 Reset password
export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

// 🟢 Logout
export async function logout() {
  return await signOut(auth);
}

// 🟢 Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/* ================================
 👤 USER PROFILE HELPER
================================ */
export async function ensureUserProfile(user: User, role: string = "customer") {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        name: user.displayName || "",
        role,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("❌ Error creating user profile:", error);
  }
}

export default app;
