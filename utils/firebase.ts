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
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔹 Config din .env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 🔸 Initialize Firebase app doar o singură dată
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔸 Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const provider = new GoogleAuthProvider();

/* ======================================================
   🔐 AUTH FUNCTIONS
====================================================== */

// 🟢 Înregistrare cu email/parolă
export async function registerWithEmail(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

// 🟢 Login cu email/parolă
export async function loginWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

// 🟢 Login cu Google
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
    const existingData = userSnap.data();
    if (!existingData.role) {
      await setDoc(userRef, { role }, { merge: true });
    }
  }

  // Dacă e firmă, adaugă în "companies"
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

// 🟢 Resetare parolă
export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

// 🟢 Logout
export async function logout() {
  return await signOut(auth);
}

// 🟢 Detectare stare utilizator (autentificat / delogat)
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/* ======================================================
   🧾 USER PROFILE UTILS
====================================================== */

export async function ensureUserProfile(user: User, role: string = "customer") {
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
}

// ✅ Export principal pentru compatibilitate
export { app };
export default app;
