import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

/**
 * Redirecționează utilizatorii în funcție de rol (admin / company / customer)
 * și asigură că datele lor sunt corect înregistrate în Firestore.
 */
export async function handleRoleRedirect(user: User, router: any) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // ✅ 1. Hardcoded override pentru admini
    const adminEmails = ["admin@admin.ro", "admin@omro.ro"];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      if (!snap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "Administrator",
          role: "admin",
          createdAt: new Date(),
        });
      } else if (snap.data().role !== "admin") {
        await setDoc(userRef, { role: "admin" }, { merge: true });
      }

      router.push("/admin/dashboard");
      return;
    }

    // ✅ 2. Verifică dacă userul are deja rol salvat
    let role = "customer";
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || "customer";
    } else {
      // Creează automat documentul de bază
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "",
        role,
        createdAt: new Date(),
      });
    }

    // ✅ 3. Redirecționare în funcție de rol
    switch (role) {
      case "admin":
        router.push("/admin/dashboard");
        break;
      case "company":
        router.push("/company/dashboard");
        break;
      case "customer":
      default:
        router.push("/customer/dashboard");
        break;
    }
  } catch (error) {
    console.error("❌ Eroare în handleRoleRedirect:", error);
    router.push("/"); // fallback home
  }
}
