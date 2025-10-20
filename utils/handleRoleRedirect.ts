import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

/**
 * Handles redirecting users based on Firestore role or email overrides.
 * Ensures admin accounts are always recognized and prevents duplicates.
 */
export async function handleRoleRedirect(user: User, router: any) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // ✅ Step 1: Special hardcoded override for admin email(s)
    const adminEmails = ["admin@admin.ro", "admin@omro.ro"];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      // Ensure Firestore record exists with role "admin"
      if (!snap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || "Administrator",
          role: "admin",
          createdAt: new Date(),
        });
      } else if (snap.data().role !== "admin") {
        // Fix wrong role if it was set as customer accidentally
        await setDoc(userRef, { role: "admin" }, { merge: true });
      }

      // ✅ Redirect to admin dashboard immediately
      router.push("/admin/dashboard");
      return;
    }

    // ✅ Step 2: Fallback — check Firestore for other users
    let role = "customer";
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || "customer";
    } else {
      // Create default record only if not admin
      await setDoc(userRef, {
        email: user.email,
        role,
        createdAt: new Date(),
      });
    }

    // ✅ Step 3: Redirect based on Firestore role
    switch (role) {
      case "admin":
        router.push("/admin/dashboard");
        break;
      case "company":
        router.push("/company/dashboard");
        break;
      default:
        router.push("/customer/dashboard");
        break;
    }
  } catch (error) {
    console.error("Error in handleRoleRedirect:", error);
    router.push("/"); // fallback home redirect
  }
}
