import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import toast from "react-hot-toast";

/**
 * 🔁 Redirecționează utilizatorul în funcție de rolul său.
 * Include feedback vizual cu toast-uri pentru o experiență fluentă.
 */
export async function handleRoleRedirect(user: User, router: AppRouterInstance) {
  if (!user?.uid || !user.email) {
    toast.error("Autentificare invalidă. Te rugăm să încerci din nou.");
    router.push("/customer/auth");
    return;
  }

  toast.loading("🔍 Verificăm rolul tău...");

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // ✅ 1. Hardcoded admin override
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

      toast.dismiss();
      toast.success("👑 Salut, Administrator! Redirecționăm către panoul de control...");
      router.push("/admin/dashboard");
      return;
    }

    // ✅ 2. Default role logic
    let role = "customer";
    if (snap.exists()) {
      role = snap.data().role || "customer";
    } else {
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "",
        role,
        createdAt: new Date(),
      });
    }

    // ✅ 3. Detect company ownership
    const companySnap = await getDoc(doc(db, "companies", user.uid));
    if (companySnap.exists()) {
      role = "company";
      await setDoc(userRef, { role: "company" }, { merge: true });
    }

    toast.dismiss();

    switch (role) {
      case "admin":
        toast.success("👑 Redirecționăm către panoul de administrare...");
        router.push("/admin/dashboard");
        break;
      case "company":
        toast.success("🏢 Redirecționăm către dashboard-ul firmei...");
        router.push("/company/dashboard");
        break;
      default:
        toast.success("🙌 Bine ai revenit! Redirecționăm către contul tău...");
        router.push("/customer/dashboard");
        break;
    }
  } catch (error: any) {
    console.error("❌ Eroare în handleRoleRedirect:", error.message);
    toast.dismiss();
    toast.error("Eroare de permisiune. Redirecționăm către contul tău...");
    router.push("/customer/dashboard");
  }
}
