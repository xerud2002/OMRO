"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { onAuthChange, db } from "../utils/firebase";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      try {
        // 🚫 Not logged in
        if (!user) {
          toast.error("🔒 Trebuie să te autentifici ca admin.");
          router.replace("/company/auth");
          return;
        }

        // 🔍 Fetch role once
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
          toast.error("⛔ Contul tău nu există în baza de date.");
          router.replace("/");
          return;
        }

        const role = userSnap.data()?.role;
        if (role === "admin") {
          setIsAdmin(true);
        } else {
          toast.error("⛔ Acces interzis! Doar adminii pot intra aici.");
          router.replace("/");
        }
      } catch (err) {
        console.error("Eroare verificare admin:", err);
        toast.error("Eroare la verificarea accesului.");
        router.replace("/");
      } finally {
        setAuthChecked(true);
      }
    });

    return () => unsub();
  }, [router]);

  // 🌀 Loading overlay
  if (!authChecked) {
    return <LoadingSpinner text="Se verifică accesul administratorului..." />;
  }

  // 🚫 Not admin
  if (!isAdmin) return null;

  // ✅ Admin verified
  return <>{children}</>;
}
