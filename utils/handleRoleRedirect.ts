import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

/**
 * Checks Firestore "users" collection for the given user
 * and redirects them based on their role.
 *
 * @param user - Firebase authenticated user
 * @param router - Next.js router instance (from useRouter())
 */
export async function handleRoleRedirect(user: User, router: any) {
  try {
    if (!user?.uid) {
      console.warn("⚠️ No authenticated user found for role redirect.");
      router.push("/customer/dashboard");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    let role = "customer"; // default

    if (snap.exists()) {
      const data = snap.data();
      role = (data.role as string) || "customer";
    } else {
      // 👤 First login — create default Firestore record
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || "",
        role,
        createdAt: new Date(),
      });
    }

    // 🔁 Redirect based on role
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
    console.error("❌ Error in handleRoleRedirect:", error);
    router.push("/customer/dashboard"); // fallback safe route
  }
}
