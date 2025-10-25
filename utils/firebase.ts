// utils/firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEhc8NVBGtYl_pBCO_bSzif8ixAWmsYQM",
  authDomain: "omro-e5a88.firebaseapp.com",
  projectId: "omro-e5a88",
  storageBucket: "omro-e5a88.appspot.com", // ✅ FIXED
  messagingSenderId: "637884424288",
  appId: "1:637884424288:web:4e7e4fb3ef403c849ea305",
  measurementId: "G-7GJERPJ8N3"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Optional Analytics (runs only in browser)
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

export { app, db, auth, storage, analytics };
