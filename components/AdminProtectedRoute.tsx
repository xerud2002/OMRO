"use client";
import { useEffect, useState } from "react";
import { onAuthChange, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (!user) {
        toast.error("🔒 Trebuie să te autentifici ca admin.");
        router.push("/company/auth");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const data = userDoc.data();

      if (!userDoc.exists() || data?.role !== "admin") {
        toast.error("⛔ Acces interzis. Doar adminii pot intra aici.");
        router.push("/");
        return;
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
        Se verifică accesul administratorului...
      </div>
    );
  }

  return <>{children}</>;
}
