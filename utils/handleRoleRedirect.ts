// utils/handleRoleRedirect.ts
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import toast from "react-hot-toast";

export async function handleRoleRedirect(user: User, router: AppRouterInstance) {
  if (!user?.uid || !user.email) {
    toast.error("Autentificare invalidă.");
    router.push("/customer/auth");
    return;
  }

  toast.loading("Verificăm rolul...");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  let role = "customer";

  if (snap.exists()) {
    role = snap.data().role || "customer";
  } else {
    await setDoc(userRef, {
      email: user.email,
      name: user.displayName || "",
      role,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  }

  // hard-coded admins
  const admins = ["admin@admin.ro", "admin@omro.ro"];
  if (admins.includes(user.email.toLowerCase())) {
    await setDoc(
      userRef,
      { role: "admin", userId: user.uid, updatedAt: serverTimestamp() },
      { merge: true }
    );
    role = "admin";
  }

  toast.dismiss();

  switch (role) {
    case "admin":
      toast.success("Bun venit, administrator!");
      router.push("/admin/dashboard");
      break;
    case "company":
      toast.success("Bun venit, companie!");
      router.push("/company/dashboard");
      break;
    default:
      toast.success("Bun venit!");
      router.push("/customer/dashboard");
      break;
  }
}
