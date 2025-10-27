import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../extra/firebase";

/**
 * Logs important admin or system actions (verification, suspension, reminder, etc.)
 * into the 'activity' collection.
 *
 * @param type - e.g. "verification", "suspension", "reminder", etc.
 * @param message - Human-readable message (e.g. "Admin verified company X")
 * @param actor - Object describing the actor: { email, name }
 * @param targetId - ID of the affected document (company, request, etc.)
 */
export async function logActivity(
  type: string,
  message: string,
  actor: { email?: string; name?: string } = {},
  targetId: string = "-"
) {
  try {
    const currentUser = auth.currentUser;

    // Prevent writes if unauthenticated
    if (!currentUser) {
      console.warn("⚠️ logActivity skipped: no authenticated user.");
      return;
    }

    // Construct full record
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
    console.error("⚠️ Eroare la logActivity:", err);
  }
}
