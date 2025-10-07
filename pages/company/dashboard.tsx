"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import CompanyLayout from "../../components/CompanyLayout";
import counties from "../../utils/counties";
import { motion } from "framer-motion";
import {
  MapPinned,
  Building2,
  CalendarDays,
  Home,
  Wallet,
  User,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";

export default function CompanyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showContacts, setShowContacts] = useState<{ [key: string]: boolean }>({});
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);

  // ✅ Auth check + company data
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const snap = await getDoc(doc(db, "companies", u.uid));
      if (!snap.exists()) {
        router.push("/company/profile");
        return;
      }

      const data = snap.data();
      setCompany({ id: u.uid, ...data });

      if (!data.verified) {
        router.push("/company/verify");
        return;
      }

      await fetchJobs([]);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // ✅ Get jobs
  const fetchJobs = async (counties: string[] = []) => {
    setLoading(true);
    let q;
    if (counties.length === 0) {
      q = query(collection(db, "requests"));
    } else if (counties.length === 1) {
      q = query(collection(db, "requests"), where("pickupCounty", "==", counties[0]));
    } else {
      q = query(collection(db, "requests"), where("pickupCounty", "in", counties.slice(0, 10)));
    }

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setJobs(list);
    setLoading(false);
  };

  // ✅ Unlock client details
  const handlePayToUnlock = async (jobId: string) => {
    const confirmPay = confirm("Plătești 10 lei pentru a debloca datele clientului?");
    if (!confirmPay) return;

    await addDoc(collection(db, "payments"), {
      companyId: company.id,
      jobId,
      amount: 10,
      method: "mock",
      status: "paid",
      createdAt: new Date(),
    });

    await addDoc(collection(db, "jobs"), {
      requestId: jobId,
      companyId: company.id,
      paid: true,
      unlockedAt: new Date(),
    });

    setShowContacts((prev) => ({ ...prev, [jobId]: true }));
    alert("✅ Ai deblocat detaliile clientului!");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-emerald-600">
        <Loader2 className="animate-spin mr-2" /> Se încarcă cererile...
      </div>
    );

  return (
    <CompanyLayout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-10"
      >
        {/* Welcome card */}
        <div className="rounded-3xl p-8 text-center bg-gradient-to-r from-emerald-500 to-sky-500 shadow-xl text-white">
          <h2 className="text-3xl font-bold mb-2">Salut, {company.name} 👋</h2>
          <p className="text-emerald-50 max-w-2xl mx-auto">
            Vizualizează cererile din județele tale și contactează clienții după deblocare.
          </p>
        </div>

        {/* County Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md p-6 text-center border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex justify-center items-center gap-2">
            <MapPinned size={20} /> Alege județele
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {counties.map((c) => {
              const selected = selectedCounties.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => {
                    const newSelected = selected
                      ? selectedCounties.filter((x) => x !== c)
                      : [...selectedCounties, c];
                    setSelectedCounties(newSelected);
                    fetchJobs(newSelected);
                  }}
                  className={`px-3 py-1 rounded-full border text-sm transition-all duration-200 ${
                    selected
                      ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-white border-emerald-500 scale-105 shadow-md"
                      : "border-gray-300 hover:bg-emerald-50 hover:scale-105"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {selectedCounties.length > 0 && (
            <button
              onClick={() => {
                setSelectedCounties([]);
                fetchJobs([]);
              }}
              className="block mx-auto mt-4 text-sm text-emerald-600 hover:underline"
            >
              Resetează selecția
            </button>
          )}
        </div>

        {/* Job Cards */}
        {jobs.length === 0 ? (
          <p className="text-center text-gray-500">
            Nu există cereri disponibile momentan.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-full p-6"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-emerald-700 leading-tight">
                    {job.serviceType || "Mutare"} — {job.pickupCity} → {job.deliveryCity}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {job.createdAt?.seconds
                      ? new Date(job.createdAt.seconds * 1000).toLocaleDateString("ro-RO")
                      : "-"}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1 text-sm text-gray-700 mb-3">
                  <p className="flex items-center gap-1">
                    <CalendarDays size={14} className="text-emerald-500" />
                    <strong>Data mutării:</strong>{" "}
                    {job.moveDate || job.moveOption || "-"}
                  </p>
                  <p className="flex items-center gap-1">
                    <Home size={14} className="text-emerald-500" />
                    <strong>Proprietate:</strong> {job.propertyType || "-"}
                  </p>
                  <p className="flex items-center gap-1">
                    <Building2 size={14} className="text-emerald-500" />
                    <strong>Dimensiune:</strong> {job.rooms || "-"}
                  </p>
                </div>

                {/* Contacts or Unlock */}
                {showContacts[job.id] ? (
                  <div className="bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 p-4 rounded-xl text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <User size={14} className="text-emerald-600" />
                      <strong>Client:</strong> {job.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-emerald-600" />
                      <strong>Telefon:</strong> {job.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-emerald-600" />
                      <strong>Email:</strong> {job.email}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePayToUnlock(job.id)}
                    className="mt-auto inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-2.5 rounded-xl font-medium shadow-md hover:scale-[1.03] transition-all"
                  >
                    <Wallet size={16} /> Deblochează client – 10 lei
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </CompanyLayout>
  );
}
