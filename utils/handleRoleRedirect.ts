import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * 🔁 Redirecționează utilizatorul în funcție de rolul său.
 * Se ocupă și de corectarea / crearea documentului în Firestore.
 */
export async function handleRoleRedirect(user: User, router: AppRouterInstance) {
  try {
    if (!user?.uid || !user.email) {
      router.push("/customer/auth");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // ✅ 1. Hardcoded override pentru admin
    const adminEmails = ["admin@admin.ro", "admin@omro.ro"];
    if (adminEmails.includes(user.email.toLowerCase())) {
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

    // ✅ 2. Verifică dacă există documentul userului
    let role = "customer";
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || "customer";
    } else {
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "",
        role,
        createdAt: new Date(),
      });
    }

    // ✅ 3. Dacă userul are o firmă înregistrată, prioritizăm acel rol
    const companySnap = await getDoc(doc(db, "companies", user.uid));
    if (companySnap.exists()) {
      role = "company";
      // ne asigurăm că și documentul din users reflectă corect
      await setDoc(userRef, { role: "company" }, { merge: true });
    }

    // ✅ 4. Redirecționare în funcție de rol
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
    router.push("/customer/auth");
  }
}
