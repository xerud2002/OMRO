"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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
    // ✅ Protect against running in non-browser environments (SSR build)
    if (typeof window === "undefined") return;

    const unsub = onAuthChange(async (user) => {
      if (!user) {
        // ✅ Use setTimeout to avoid router.replace being called before hydration
        setTimeout(() => {
          toast.error("Trebuie să te autentifici!");
          router.replace("/company/auth");
        }, 100);
        setAuthChecked(true);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const role = userSnap.exists() ? userSnap.data()?.role : null;

        if (role === "admin") {
          setIsAdmin(true);
        } else {
          setTimeout(() => {
            toast.error("⛔ Acces interzis! Doar adminii pot intra aici.");
            router.replace("/");
          }, 100);
        }
      } catch (err) {
        console.error("Eroare la verificarea accesului admin:", err);
        setTimeout(() => {
          toast.error("Eroare la verificare acces.");
          router.replace("/");
        }, 100);
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
