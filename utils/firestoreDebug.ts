// utils/firestoreDebug.ts
import { setLogLevel } from "firebase/firestore";

/**
 * Enables Firestore diagnostic logging.
 * Call this once early in your app (e.g. _app.tsx or MoveForm.tsx).
 */
export function enableFirestoreDebug() {
  // Log everything Firestore sends/receives, including rule failures
  setLogLevel("debug");
  console.log("🔍 Firestore debug logging enabled");
}
