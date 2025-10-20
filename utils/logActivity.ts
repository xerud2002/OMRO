import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Logs important admin actions (verification, suspension, reminder, etc.)
 * into the 'activity' collection.
 */
export async function logActivity(
  type: string,
  message: string,
  actor: any,
  targetId: string
) {
  try {
    await addDoc(collection(db, "activity"), {
      type,
      message,
      actor, // {email, name}
      targetId,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Activity logged:", message);
  } catch (err) {
    console.error("⚠️ Eroare la logActivity:", err);
  }
}
