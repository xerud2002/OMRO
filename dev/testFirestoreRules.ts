import { auth, db } from "@/services/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

/**
 * Testează direct regulile Firestore.
 * Scrie un document temporar în colecția "test_permissions"
 * și raportează clar dacă e blocat de autentificare, de userId sau de altă regulă.
 */
export async function testFirestoreRules(): Promise<string> {
  const user = auth.currentUser;

  if (!user) {
    return "❌ Nu ești autentificat. Loghează-te înainte de test.";
  }

  const uid = user.uid;
  const testRef = doc(db, "test_permissions", uid);

  try {
    await setDoc(testRef, {
      userId: uid,
      email: user.email,
      timestamp: Timestamp.now(),
    });

    return "✅ Scriere reușită — regula Firestore permite CREATE (userId potrivit).";
  } catch (err: any) {
    console.error("❌ Eroare Firestore:", err);

    if (err?.code === "permission-denied") {
      return (
        "🚫 Firestore a refuzat accesul.\n" +
        "Verifică în consola Firebase regula din `firestore.rules`:\n\n" +
        "allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;\n\n" +
        `Utilizator actual: ${uid}`
      );
    }

    return `❌ Alte eroare Firestore: ${err?.message || err}`;
  }
}
