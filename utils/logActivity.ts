// utils/logActivity.ts
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Logs any admin-visible action into /activityLogs for transparency
 * @param type - "message", "payment", "verification", etc.
 * @param description - A readable description of the event
 * @param user - The current user (auth object or null)
 * @param entityId - Optional related entity (e.g. requestId)
 */
export async function logActivity(
  type: string,
  description: string,
  user?: any,
  entityId?: string
) {
  try {
    await addDoc(collection(db, "activityLogs"), {
      type,
      description,
      entityId: entityId || null,
      userName: user?.displayName || user?.name || user?.email || "Anonim",
      email: user?.email || "-",
      createdAt: Timestamp.now(),
      reviewed: false,
    });
  } catch (err) {
    console.error("❌ Eroare la logare activitate:", err);
  }
}
