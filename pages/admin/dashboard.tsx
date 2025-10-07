"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Building2,
  ClipboardList,
  Users,
  ShieldCheck,
  Clock,
  ActivitySquare,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";

// ✅ Data Interfaces
interface CompanyData {
  id: string;
  verified?: boolean;
  submittedForVerification?: boolean;
  suspended?: boolean;
  county?: string;
}

interface UserData {
  id: string;
  role?: string;
}

interface RequestData {
  id: string;
  customerName?: string;
  pickupCity?: string;
  deliveryCity?: string;
  pickupCounty?: string;
  status?: "noua" | "in_interes" | "finalizata" | "anulata";
}

export default function AdminDashboardOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const snap = await getDoc(doc(db, "users", u.uid));
      const isAdmin = snap.exists() && snap.data().role === "admin";

      if (!isAdmin) {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      try {
        // Load all data in parallel
        const [companiesSnap, usersSnap, requestsSnap] = await Promise.all([
          getDocs(collection(db, "companies")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "requests")),
        ]);

        setCompanies(
          companiesSnap.docs.map((d) => ({ ...d.data(), id: d.id } as CompanyData))
        );
        setUsers(usersSnap.docs.map((d) => ({ ...d.data(), id: d.id } as UserData)));
        setRequests(
          requestsSnap.docs.map((d) => ({ ...d.data(), id: d.id } as RequestData))
        );
      } catch (err) {
        console.error("❌ Eroare la încărcarea datelor:", err);
        toast.error("Eroare la încărcarea datelor.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          Se încarcă dashboard-ul...
        </div>
      </AdminLayout>
    );

  // --- Statistics ---
  const verifiedCompanies = companies.filter((c) => c.verified).length;
  const pendingCompanies = companies.filter(
    (c) => c.submittedForVerification && !c.verified
  ).length;
  const totalRequests = requests.length;
  const totalUsers = users.filter((u) => u.role === "customer").length;

  // ✅ Request statuses
  const newRequests = requests.filter((r) => r.status === "noua").length;
  const interestRequests = requests.filter((r) => r.status === "in_interes").length;
  const completedRequests = requests.filter((r) => r.status === "finalizata").length;
  const canceledRequests = requests.filter((r) => r.status === "anulata").length;

  const pieData = [
    { name: "Nouă", value: newRequests, color: "#facc15" },
    { name: "În interes", value: interestRequests, color: "#3b82f6" },
    { name: "Finalizată", value: completedRequests, color: "#10b981" },
    { name: "Anulată", value: canceledRequests, color: "#ef4444" },
  ];

  // --- Top counties ---
  const countiesCount: Record<string, number> = {};
  requests.forEach((r) => {
    if (r.pickupCounty) {
      countiesCount[r.pickupCounty] = (countiesCount[r.pickupCounty] || 0) + 1;
    }
  });

  const topCounties = Object.entries(countiesCount)
    .map(([county, count]) => ({ county, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-6 mb-20"
      >
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
          🧭 Panou Administrativ – Prezentare generală
        </h1>

        {/* --- Summary Cards --- */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Companii verificate"
            value={verifiedCompanies}
            color="from-green-400 to-emerald-600"
            icon={<ShieldCheck size={26} />}
          />
          <StatCard
            title="În așteptare"
            value={pendingCompanies}
            color="from-yellow-400 to-orange-500"
            icon={<Clock size={26} />}
          />
          <StatCard
            title="Clienți activi"
            value={totalUsers}
            color="from-sky-400 to-blue-600"
            icon={<Users size={26} />}
          />
          <StatCard
            title="Cererile totale"
            value={totalRequests}
            color="from-emerald-400 to-green-600"
            icon={<ClipboardList size={26} />}
          />
        </div>

        {/* --- Charts --- */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Cereri per status */}
          <div className="bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Distribuția cererilor
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top județe */}
          <div className="bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">
              Top județe cu cele mai multe cereri
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCounties}>
                <XAxis dataKey="county" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Latest Activity --- */}
        <div className="bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <ActivitySquare size={20} /> Ultimele cereri primite
          </h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">Nu există cereri recente.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {requests.slice(-5).reverse().map((r) => (
                <li
                  key={r.id}
                  className="py-2 flex justify-between items-center text-sm text-gray-700"
                >
                  <span>
                    📦 <strong>{r.customerName || "Client"}</strong> din{" "}
                    <em>{r.pickupCity || "-"}</em> →{" "}
                    <em>{r.deliveryCity || "-"}</em>
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      r.status === "finalizata"
                        ? "bg-green-100 text-green-700"
                        : r.status === "in_interes"
                        ? "bg-blue-100 text-blue-700"
                        : r.status === "anulata"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.status || "nouă"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Quick Links --- */}
        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          <QuickLink
            title="Gestionează Companiile"
            path="/admin/companies"
            icon={<Building2 size={28} />}
            color="from-green-400 to-emerald-600"
          />
          <QuickLink
            title="Gestionează Clienții"
            path="/admin/clients"
            icon={<Users size={28} />}
            color="from-sky-400 to-blue-600"
          />
          <QuickLink
            title="Gestionează Cererile"
            path="/admin/requests"
            icon={<ClipboardList size={28} />}
            color="from-yellow-400 to-orange-500"
          />
        </div>
      </motion.div>
    </AdminLayout>
  );
}

/* ---------- Reusable Components ---------- */

function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center`}
    >
      <div className="mb-3">{icon}</div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1">{title}</p>
    </motion.div>
  );
}

function QuickLink({
  title,
  path,
  icon,
  color,
}: {
  title: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link href={path}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`cursor-pointer bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center transition`}
      >
        {icon}
        <p className="mt-3 font-semibold text-center">{title}</p>
      </motion.div>
    </Link>
  );
}
