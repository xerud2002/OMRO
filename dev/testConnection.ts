// utils/testConnection.ts
import { auth, db, storage } from "../services/firebase";
import {
  signInAnonymously,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * 🔍 Test Firebase connection (Auth, Firestore, Storage)
 * Works both for logged users and anonymous sessions.
 */
export async function testFirebaseConnection(): Promise<string> {
  if (typeof window === "undefined") {
    return "⚠️ Testul nu poate rula pe server (SSR). Deschide-l în browser.";
  }

  console.log("🚀 Pornim testul complet Firebase...\n");

  let user: User | null = auth.currentUser;

  // 1️⃣ AUTH TEST
  try {
    if (!user) {
      console.warn("⚠️ Utilizator neautentificat — se creează sesiune anonimă...");
      const anon = await signInAnonymously(auth);
      user = anon.user;
    }
    if (!user) throw new Error("Autentificare eșuată complet.");

    console.log(`👤 Autentificat ca: ${user.email || "anonim"} (uid: ${user.uid})`);
  } catch (err: any) {
    console.error("❌ Eroare la autentificare:", err);
    return "❌ Autentificare eșuată — nu s-a putut inițializa sesiunea.";
  }

  const uid = user!.uid;

  // 2️⃣ FIRESTORE TEST
  try {
    const testDocRef = doc(db, "test_connection", uid);
    const payload = {
      userId: uid,
      email: user.email || null,
      createdAt: Timestamp.now(),
      status: "ping",
    };

    await setDoc(testDocRef, payload);
    console.log("✅ Firestore write OK");

    const readSnap = await getDoc(testDocRef);
    if (!readSnap.exists()) throw new Error("Firestore read failed");
    console.log("✅ Firestore read OK");

    await deleteDoc(testDocRef);
    console.log("✅ Firestore delete OK");
  } catch (err: any) {
    console.error("❌ Eroare Firestore:", err);
    return `❌ Firestore failed: ${err.message}`;
  }

  // 3️⃣ STORAGE TEST
  try {
    const testFileRef = ref(storage, `test/${uid}_test.txt`);
    const testData = `Test connection - ${new Date().toISOString()}`;
    await uploadString(testFileRef, testData, "raw");
    console.log("✅ Storage upload OK");

    const url = await getDownloadURL(testFileRef);
    console.log("✅ Storage read OK:", url);

    await deleteObject(testFileRef);
    console.log("✅ Storage delete OK");
  } catch (err: any) {
    console.error("❌ Eroare Storage:", err);
    return `❌ Storage failed: ${err.message}`;
  }

  // 4️⃣ SUCCESS
  console.log("\n🎯 Toate testele Firebase au trecut cu succes!");
  return "✅ Conexiune complet funcțională: Auth + Firestore + Storage!";
}

