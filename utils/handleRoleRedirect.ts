import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

/**
 * Checks Firestore "users" collection for the given user
 * and redirects them based on their role.
 * 
 * @param user - Firebase authenticated user
 * @param router - Next.js router instance (from useRouter() or server context)
 */
export async function handleRoleRedirect(user: User, router: any) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    let role = "customer";

    if (snap.exists()) {
      const data = snap.data();
      role = data.role || "customer";
    } else {
      // create default record if missing
      await setDoc(userRef, {
        email: user.email,
        role,
        createdAt: new Date(),
      });
    }

    switch (role) {
      case "admin":
        router.push("/admin/companies");
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
    router.push("/"); // fallback redirect
  }
}
