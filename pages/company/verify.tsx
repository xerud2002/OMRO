"use client";
import { useEffect, useState } from "react";
import { db, auth, onAuthChange } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import CompanyLayout from "../../components/CompanyLayout";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  XCircle,
  FileText,
  User,
  MapPin,
  Building2,
  Upload,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function CompanyVerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const snap = await getDoc(doc(db, "companies", u.uid));
      if (snap.exists()) {
        setCompany(snap.data());
      } else {
        router.push("/company/profile");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleResubmit = async () => {
    if (!auth.currentUser) return;
    await setDoc(
      doc(db, "companies", auth.currentUser.uid),
      { submittedForVerification: true },
      { merge: true }
    );
    alert("📩 Profil retrimis spre verificare!");
  };

  if (loading)
    return (
      <CompanyLayout>
        <div className="flex justify-center items-center h-[60vh] text-emerald-600">
          <Loader2 className="animate-spin mr-2" /> Se încarcă...
        </div>
      </CompanyLayout>
    );

  if (!company)
    return (
      <CompanyLayout>
        <p className="text-center text-gray-500 p-10">
          Nu există date de firmă.
        </p>
      </CompanyLayout>
    );

  const isVerified = company.verified;
  const isPending = company.submittedForVerification && !isVerified;
  const statusIcon = isVerified
    ? ShieldCheck
    : isPending
    ? Clock
    : XCircle;
  const StatusIcon = statusIcon;
  const statusColor = isVerified
    ? "text-emerald-600"
    : isPending
    ? "text-yellow-500"
    : "text-gray-400";
  const statusLabel = isVerified
    ? "✅ Verificată"
    : isPending
    ? "⏳ În curs de verificare"
    : "❌ Neverificată";

  return (
    <CompanyLayout>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-10 border border-emerald-100 mt-10 mb-20"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <StatusIcon
            size={48}
            className={`mx-auto mb-3 ${statusColor}`}
          />
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">
            Verificare firmă
          </h1>
          <p className={`text-lg font-medium ${statusColor}`}>
            Status actual: {statusLabel}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {isVerified
              ? "✅ Profilul tău este verificat și vizibil pe ofertemutare.ro."
              : isPending
              ? "Echipa ofertemutare.ro verifică documentele (1-2 zile lucrătoare)."
              : "Completează profilul și trimite documentele pentru verificare."}
          </p>
        </div>

        {/* Divider */}
        <hr className="border-t border-emerald-100 my-8" />

        {/* Details Section */}
        <Section icon={<Building2 size={18} />} title="Detalii firmă">
          <p><strong>Nume firmă:</strong> {company.name || "-"}</p>
          <p><strong>CUI:</strong> {company.cui || "-"}</p>
          <p><strong>Adresă:</strong> {company.address || "-"}</p>
          <p><strong>Telefon:</strong> {company.phone || "-"}</p>
          <p><strong>Email:</strong> {company.email || "-"}</p>
          <p><strong>Oraș:</strong> {company.city || "-"}</p>
          <p><strong>Județ:</strong> {company.county || "-"}</p>
        </Section>

        <Section icon={<User size={18} />} title="Persoană de contact">
          <p><strong>Nume:</strong> {company.contactName || "-"}</p>
          <p><strong>Funcție:</strong> {company.contactRole || "-"}</p>
          <p><strong>Telefon:</strong> {company.contactPhone || "-"}</p>
          <p><strong>Email:</strong> {company.contactEmail || "-"}</p>
        </Section>

        <Section icon={<FileText size={18} />} title="Servicii oferite">
          <p>
            {company.services && company.services.length > 0
              ? company.services.join(", ")
              : "–"}
          </p>
        </Section>

        <Section icon={<Upload size={18} />} title="Documente încărcate">
          {company.documents && company.documents.length > 0 ? (
            <ul className="list-disc list-inside text-sm space-y-1">
              {company.documents.map((url: string, i: number) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    className="text-emerald-600 hover:underline"
                  >
                    Document {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Niciun document încărcat.</p>
          )}
        </Section>

        {company.logo && (
          <Section icon={<MapPin size={18} />} title="Logo firmă">
            <img
              src={company.logo}
              alt="Logo firmă"
              className="mx-auto w-24 h-24 rounded-full object-cover border-2 border-emerald-100 shadow-md"
            />
          </Section>
        )}

        {/* Status Action */}
        {!isVerified && (
          <div className="text-center mt-8">
            <button
              onClick={handleResubmit}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2.5 rounded-xl shadow-md hover:scale-[1.03] transition-all"
            >
              <RefreshCw size={18} /> Retrimite spre verificare
            </button>
          </div>
        )}
      </motion.div>
    </CompanyLayout>
  );
}

/* ---------- Reusable Section ---------- */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold text-emerald-700 mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="bg-white/60 p-4 rounded-2xl border border-emerald-100 text-sm text-gray-700 space-y-1 shadow-sm">
        {children}
      </div>
    </section>
  );
}
