"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { onAuthChange, db } from "../utils/firebase";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      // 🚫 Not logged in
      if (!user) {
        toast.error("🔒 Trebuie să te autentifici ca admin.");
        await router.push("/company/auth");
        return;
      }

      // 🔍 Verify user role
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data()?.role !== "admin") {
        toast.error("⛔ Acces interzis. Doar adminii pot intra aici.");
        await router.push("/");
        return;
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // ⏳ Loading state
  if (loading) {
    return (
      <LoadingSpinner text="Se verifică accesul administratorului..." />
    );
  }

  // ✅ Access granted
  return <>{children}</>;
}
