/**
 * Script: seedUsers.ts
 * Purpose: Creates default admin, client, and company users in Firebase Authentication + Firestore.
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// 🔹 Your Firebase config (same as in utils/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Default test users
const users = [
  {
    email: "admin@oferemutare.ro",
    password: "123456",
    role: "admin",
    name: "Admin User",
    verified: true,
  },
  {
    email: "client@oferemutare.ro",
    password: "123456",
    role: "client",
    name: "Client User",
  },
  {
    email: "company@oferemutare.ro",
    password: "123456",
    role: "company",
    name: "Company User",
    verified: true,
  },
];

async function seedUsers() {
  console.log("🚀 Starting seed process...");
  for (const user of users) {
    try {
      // Try to log in first (skip if exists)
      let userRecord;
      try {
        const login = await signInWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        userRecord = login.user;
        console.log(`✅ ${user.email} already exists.`);
      } catch {
        // Create user if not exists
        const created = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        userRecord = created.user;
        console.log(`🆕 Created user: ${user.email}`);
      }

      // Add Firestore document
      const userRef = doc(db, "users", userRecord.uid);
      await setDoc(userRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified || false,
        createdAt: serverTimestamp(),
      });
      console.log(`📄 Firestore doc added for ${user.email}`);
    } catch (err: any) {
      console.error(`❌ Error seeding ${user.email}:`, err.message);
    }
  }

  console.log("✅ Seeding complete!");
}

seedUsers();
