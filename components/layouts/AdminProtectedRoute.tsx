"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "../../utils/firebaseHelpers";
import { db } from "../../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import LoadingSpinner from "../ui/LoadingSpinner";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

/**
 * 🔒 Protects admin-only routes
 */
export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        toast.error("Autentifică-te pentru a accesa panoul de administrare.");
        router.push("/admin/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();

        if (!data || data.role !== "admin") {
          toast.error("⛔ Acces interzis!");
          router.push("/");
          return;
        }

        setAllowed(true);
      } catch (err) {
        console.error("Eroare la verificarea accesului:", err);
        toast.error("Eroare la verificarea accesului.");
        router.push("/");
      } finally {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (checking) {
    return <LoadingSpinner text="Se verifică accesul..." />;
  }

  if (!allowed) return null;

  return <>{children}</>;
}
