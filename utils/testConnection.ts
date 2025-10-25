import { auth, db, storage } from "./firebase";
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from "firebase/firestore";
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

/**
 * 🔍 Test Firebase connection and permissions
 * Runs checks for Auth, Firestore, and Storage.
 */
export async function testFirebaseConnection(): Promise<string> {
  console.log("🚀 Starting Firebase connectivity test...");

  // 1️⃣ AUTH CHECK
  const user = auth.currentUser;
  if (!user) {
    console.error("❌ User not authenticated!");
    return "❌ Autentificare eșuată — trebuie să fii logat.";
  }

  const uid = user.uid;
  console.log(`👤 Autentificat ca: ${user.email || uid}`);

  try {
    // 2️⃣ FIRESTORE TEST
    const testDocRef = doc(db, "test_connection", uid);
    const payload = {
      userId: uid,
      email: user.email,
      createdAt: Timestamp.now(),
      status: "test",
    };

    await setDoc(testDocRef, payload);
    console.log("✅ Firestore write OK");

    const readSnap = await getDoc(testDocRef);
    if (!readSnap.exists()) throw new Error("Firestore read failed.");
    console.log("✅ Firestore read OK");

    await deleteDoc(testDocRef);
    console.log("✅ Firestore delete OK");

    // 3️⃣ STORAGE TEST
    const testFileRef = ref(storage, `test/${uid}_test.txt`);
    const testData = `Test connection - ${new Date().toISOString()}`;
    await uploadString(testFileRef, testData, "raw");
    console.log("✅ Storage upload OK");

    const url = await getDownloadURL(testFileRef);
    console.log("✅ Storage read OK:", url);

    await deleteObject(testFileRef);
    console.log("✅ Storage delete OK");

    // 4️⃣ SUCCESS
    console.log("🎉 All Firebase checks passed successfully!");
    return "✅ Conexiune complet funcțională: Auth + Firestore + Storage!";
  } catch (err: any) {
    console.error("❌ Firebase test failed:", err);
    return `❌ Eroare Firebase: ${err.message || "verifică console.log pentru detalii"}`;
  }
}
