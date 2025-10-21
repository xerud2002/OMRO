"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, onAuthChange } from "../../../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AdminLayout from "../../../components/AdminLayout";
import AdminProtectedRoute from "../../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Building2,
  Mail,
  Landmark,
  ShieldCheck,
  Ban,
  Loader2,
  ArrowLeft,
  FileText,
  FolderOpen,
  CheckCircle,
} from "lucide-react";
import { logActivity } from "../../../utils/logActivity";

export default function AdminCompanyProfile() {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  // 🔹 Load company data
  const loadCompany = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, "companies", companyId));
      if (snap.exists()) {
        setCompany({ id: companyId, ...snap.data() });
      } else {
        toast.error("Compania nu există!");
        router.push("/admin/companies");
      }
    } catch (err) {
      console.error("Eroare la încărcare companie:", err);
      toast.error("Eroare la încărcare companie!");
    } finally {
      setLoading(false);
    }
  }, [companyId, router]);

  // 🔹 Verify admin and load company
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (!userSnap.exists() || userSnap.data().role !== "admin") {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      await loadCompany();
    });

    return () => unsub();
  }, [router, loadCompany]);

  // 🔹 Toggle verification
  const toggleVerification = async () => {
    try {
      const newStatus = !company.verified;
      await updateDoc(doc(db, "companies", companyId), { verified: newStatus });
      await logActivity(
        "verification",
        `${newStatus ? "✅ Verificare" : "❌ Revocare"} manuală pentru ${company.name}`,
        { email: "admin@panel" },
        companyId
      );
      setCompany((p: any) => ({ ...p, verified: newStatus }));
      toast.success(
        newStatus ? "Compania a fost verificată!" : "Verificarea a fost revocată!"
      );
    } catch (err) {
      console.error("Eroare la verificare:", err);
      toast.error("Eroare la actualizare statut!");
    }
  };

  // 🔹 Toggle suspension
  const toggleSuspension = async () => {
    try {
      const newStatus = !company.suspended;

      toast.loading(
        newStatus ? "⏳ Se suspendă compania..." : "⏳ Se reactivează compania..."
      );

      await updateDoc(doc(db, "companies", companyId), { suspended: newStatus });
      await logActivity(
        "suspension",
        `${newStatus ? "🚫 Suspendare" : "♻️ Reactivare"} pentru ${company.name}`,
        { email: "admin@panel" },
        companyId
      );

      setCompany((p: any) => ({ ...p, suspended: newStatus }));

      toast.dismiss();
      toast.success(
        newStatus ? "🚫 Compania a fost suspendată!" : "✅ Compania a fost reactivată!"
      );
    } catch (err) {
      console.error("Eroare la suspendare:", err);
      toast.dismiss();
      toast.error("❌ Eroare la actualizare statut!");
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[70vh] text-emerald-600">
          <Loader2 className="animate-spin mr-2" /> Se încarcă profilul companiei...
        </div>
      </AdminLayout>
    );

  if (!company) return null;

  const documents =
    company.documents && Array.isArray(company.documents)
      ? company.documents
      : [];

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          {/* Back button */}
          <button
            onClick={() => router.push("/admin/companies")}
            className="mb-4 flex items-center text-emerald-600 hover:text-emerald-800 transition"
          >
            <ArrowLeft size={18} className="mr-1" /> Înapoi la listă
          </button>

          {/* Header */}
          <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2 mb-6">
            <Building2 size={26} /> {company.name || "Fără nume"}
          </h1>

          {/* Company Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                <Mail size={16} /> Informații de contact
              </h2>
              <p>Email: {company.email || "-"}</p>
              <p>Telefon: {company.phone || "-"}</p>
              <p>Oraș: {company.city || "-"}</p>
              <p>Județ: {company.county || "-"}</p>
              <p>Adresă: {company.address || "-"}</p>
            </div>

            <div>
              <h2 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                <Landmark size={16} /> Statut firmă
              </h2>
              <p>
                {company.verified ? (
                  <span className="text-green-600 font-semibold">✅ Verificată</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">⏳ În așteptare</span>
                )}
              </p>
              <p>
                {company.suspended ? (
                  <span className="text-red-600 font-semibold">🚫 Suspendată</span>
                ) : (
                  <span className="text-gray-600">Activă</span>
                )}
              </p>
              {company.insurance && (
                <p className="mt-2 text-emerald-600 flex items-center gap-1">
                  <CheckCircle size={14} /> Asigurare activă
                </p>
              )}
            </div>
          </div>

          {/* Services */}
          {company.services?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <FolderOpen size={16} /> Servicii oferite
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.services.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                <FileText size={16} /> Documente încărcate
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {documents.map((url: string, i: number) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 underline"
                    >
                      Document {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <button
              onClick={toggleVerification}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-sm shadow-md hover:scale-105 transition"
            >
              <ShieldCheck size={16} />{" "}
              {company.verified ? "Revocă verificarea" : "Verifică compania"}
            </button>

            <button
              onClick={toggleSuspension}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm shadow-md hover:scale-105 transition ${
                company.suspended
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <Ban size={16} />{" "}
              {company.suspended ? "Activează din nou" : "Suspendă compania"}
            </button>
          </div>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
