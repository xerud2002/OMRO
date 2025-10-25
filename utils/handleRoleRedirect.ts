import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import toast from "react-hot-toast";

/**
 * 🔁 Redirecționează utilizatorul în funcție de rolul său.
 * Compatibil cu reguli Firestore restrictive și fallback sigur pentru roluri lipsă.
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
    let userSnap = null;

    try {
      userSnap = await getDoc(userRef);
    } catch (e) {
      console.warn("⚠️ Lipsă acces temporar la users/", user.uid, e);
    }

    // ✅ Hardcoded admin override
    const adminEmails = ["admin@admin.ro", "admin@omro.ro"];
    if (adminEmails.includes(user.email.toLowerCase())) {
      if (!userSnap?.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "Administrator",
          role: "admin",
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      } else if (userSnap.data().role !== "admin") {
        await setDoc(
          userRef,
          { role: "admin", userId: user.uid, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }

      toast.dismiss();
      toast.success("👑 Salut, Administrator! Redirecționăm către panoul de control...");
      router.push("/admin/dashboard");
      return;
    }

    // ✅ Default role = customer
    let role = "customer";
    if (userSnap?.exists()) {
      role = userSnap.data().role || "customer";
    } else {
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "",
        role,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    }

    // ✅ Check if company document exists (verified business account)
    try {
      const companySnap = await getDoc(doc(db, "companies", user.uid));
      if (companySnap.exists()) {
        role = "company";
        await setDoc(
          userRef,
          { role: "company", userId: user.uid, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }
    } catch (e) {
      console.warn("⚠️ Lipsă acces temporar la companies/", e);
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
        // 🔸 Dacă e primul login, mergem direct la formular
        if (!userSnap?.exists()) {
          toast.success("🎉 Bine ai venit! Începem cu cererea ta de mutare...");
          router.push("/form");
        } else {
          toast.success("🙌 Bine ai revenit! Redirecționăm către contul tău...");
          router.push("/customer/dashboard");
        }
        break;
    }
  } catch (error: any) {
    console.error("❌ Eroare în handleRoleRedirect:", error.message);
    toast.dismiss();
    toast.error("Eroare la verificarea rolului. Redirecționăm către contul tău...");
    router.push("/customer/dashboard");
  }
}
