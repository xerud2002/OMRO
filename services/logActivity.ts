import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/config/firebaseConfig";

/**
 * Logs important admin or system actions (verification, suspension, etc.)
 * into the 'activity' Firestore collection.
 *
 * @param type - e.g. "verification", "suspension", "reminder"
 * @param message - Description of the action
 * @param actor - The user performing the action (optional)
 * @param targetId - The document ID affected (company, request, etc.)
 */
export async function logActivity(
  type: string,
  message: string,
  actor: { email?: string; name?: string } = {},
  targetId: string = "-"
) {
  try {
    const currentUser = auth.currentUser;

    // Prevent writing logs if no authenticated user
    if (!currentUser) {
      console.warn("⚠️ logActivity skipped: no authenticated user.");
      return;
    }

    const data = {
      type,
      message,
      actor: {
        email: actor.email || currentUser.email || "unknown",
        name: actor.name || "Admin",
        uid: currentUser.uid,
      },
      targetId,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "activity"), data);
    console.log("✅ Activity logged:", message);
  } catch (err) {
    console.error("⚠️ Error in logActivity:", err);
  }
}
