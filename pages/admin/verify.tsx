"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminVerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // redirect to pending tab in companies
    router.replace("/admin/companies?tab=pending");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-emerald-600">
      Redirecționare către companiile în așteptare...
    </div>
  );
}
