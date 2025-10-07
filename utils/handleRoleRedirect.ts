import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";

/**
 * Checks Firestore "users" collection for the given user
 * and redirects them based on their role.
 */
export async function handleRoleRedirect(
  user: User,
  router: AppRouterInstance
) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  let role = "customer";

  if (snap.exists()) {
    const data = snap.data();
    role = data.role || "customer";
  } else {
    // if missing, create a default customer record
    await setDoc(userRef, {
      email: user.email,
      role,
      createdAt: new Date(),
    });
  }

  if (role === "admin") router.push("/admin/companies");
  else if (role === "company") router.push("/company/dashboard");
  else router.push("/customer/dashboard");
}
