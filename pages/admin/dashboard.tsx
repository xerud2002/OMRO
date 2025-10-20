"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
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
  CartesianGrid,
} from "recharts";
import {
  Building2,
  ClipboardList,
  Users,
  ShieldCheck,
  Clock,
  Activity,
  Coins,
  Star,
  MessageSquare,
  Settings,
  FileDown,
  MessageCircle,
  Mail,
  Factory,
  Gift, // 🎁 nou
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";

interface CompanyData {
  id: string;
  verified?: boolean;
  submittedForVerification?: boolean;
  freeLeads?: number;
}
interface UserData {
  id: string;
  role?: string;
}
interface RequestData {
  id: string;
  pickupCounty?: string;
  status?: string;
}
interface PaymentData {
  id: string;
  amount?: number | string;
  createdAt?: any;
}
interface LogData {
  id: string;
  description?: string;
  type?: string;
  createdAt?: any;
}
interface MessageData {
  id: string;
  status?: string;
}

export default function AdminDashboardOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);

  // 🔹 Load data
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      const snap = await getDoc(doc(db, "users", u.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        toast.error("⛔ Acces interzis!");
        router.push("/");
        return;
      }

      try {
        const [compSnap, userSnap, reqSnap, paySnap, logSnap, msgSnap] = await Promise.allSettled([
          getDocs(collection(db, "companies")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "requests")),
          getDocs(collection(db, "payments")),
          getDocs(
            query(
              collection(db, "activity"),
              orderBy("createdAt", "desc"),
              limit(6)
            )
          ),
          getDocs(collection(db, "messages")),
        ]);

        // ✅ safely extract results (ignore failed ones)
        const extract = (res: any) =>
          res.status === "fulfilled" ? res.value.docs.map((d: any) => ({ id: d.id, ...d.data() })) : [];

        setCompanies(extract(compSnap));
        setUsers(extract(userSnap));
        setRequests(extract(reqSnap));
        setPayments(extract(paySnap));
        setLogs(extract(logSnap));
        setMessages(extract(msgSnap));
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea dashboardului!");
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

  // ---------- KPI STATS ----------
  const verifiedCompanies = companies.filter((c) => c.verified).length;
  const pendingCompanies = companies.filter(
    (c) => c.submittedForVerification && !c.verified
  ).length;
  const totalClients = users.filter((u) => u.role === "customer").length;
  const totalRequests = requests.length;

  // ✅ FIXED totalRevenue
  const totalRevenue = payments.reduce((sum, p) => {
    if (typeof p.amount === "number") return sum + p.amount;
    if (typeof p.amount === "string") return sum + parseFloat(p.amount);
    return sum;
  }, 0);

  const totalMessages = messages.length;

  // 🔹 NEW — Free Leads Stats
  const activeFreeCompanies = companies.filter((c) => (c.freeLeads ?? 0) > 0).length;
  const totalFreeLeads = companies.reduce((sum, c) => sum + (c.freeLeads ?? 0), 0);

  // ---------- CHARTS ----------
  const statusGroups = ["noua", "in_interes", "finalizata", "anulata"];
  const pieData = statusGroups.map((s) => ({
    name: s,
    value: requests.filter((r) => r.status === s).length,
    color:
      s === "noua"
        ? "#facc15"
        : s === "in_interes"
        ? "#3b82f6"
        : s === "finalizata"
        ? "#10b981"
        : "#ef4444",
  }));

  const countyCount: Record<string, number> = {};
  requests.forEach((r) => {
    if (r.pickupCounty) {
      countyCount[r.pickupCounty] = (countyCount[r.pickupCounty] || 0) + 1;
    }
  });

  const topCounties = Object.entries(countyCount)
    .map(([county, count]) => ({ county, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const monthlyRevenue: Record<string, number> = {};
  payments.forEach((p) => {
    if (p.createdAt?.seconds) {
      const d = new Date(p.createdAt.seconds * 1000);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const amount =
        typeof p.amount === "number"
          ? p.amount
          : parseFloat(p.amount ?? "0");
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + amount;
    }
  });

  const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  // ---------- UI ----------
  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-6 mb-20"
      >
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10">
          🧭 Dashboard Administrativ
        </h1>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-7 gap-6 mb-12">
          <StatCard title="Companii verificate" value={verifiedCompanies} icon={<ShieldCheck />} color="from-green-400 to-emerald-600" />
          <StatCard title="În verificare" value={pendingCompanies} icon={<Clock />} color="from-yellow-400 to-orange-500" />
          <StatCard title="Clienți activi" value={totalClients} icon={<Users />} color="from-sky-400 to-blue-600" />
          <StatCard title="Cererile totale" value={totalRequests} icon={<ClipboardList />} color="from-emerald-400 to-green-600" />
          <StatCard title="Venit total (RON)" value={totalRevenue.toFixed(2)} icon={<Coins />} color="from-emerald-500 to-sky-600" />
          <StatCard title="Lead-uri gratuite active" value={`${activeFreeCompanies}/${totalFreeLeads}`} icon={<Gift />} color="from-pink-400 to-rose-600" />
          <StatCard title="Conversații active" value={messages.length} icon={<MessageCircle />} color="from-indigo-400 to-purple-600" />
        </div>

        {/* restul codului rămâne identic */}
        {/* Charts, Activity Feed, Quick Links */}
        {/* ... (nu modificăm nimic mai jos) */}


        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <ChartCard
            title="Distribuția cererilor"
            icon={<ClipboardList size={18} />}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Județe" icon={<Building2 size={18} />}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCounties}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="county" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Venit Lunar" icon={<Coins size={18} />}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#38BDF8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <Activity size={20} /> Ultima activitate
          </h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">Nicio activitate recentă.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {logs.map((log) => {
                const icon =
                  log.type === "message"
                    ? "💬"
                    : log.type === "unlock"
                    ? "🔓"
                    : log.type === "payment"
                    ? "💸"
                    : "📦";
                return (
                  <li
                    key={log.id}
                    className="py-2 flex justify-between items-center text-sm text-gray-700"
                  >
                    <span>
                      {icon} <strong>{log.type}</strong> — {log.description}
                    </span>
                    <span className="text-xs text-gray-400">
                      {log.createdAt?.seconds
                        ? new Date(
                            log.createdAt.seconds * 1000
                          ).toLocaleString("ro-RO")
                        : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
          <QuickLink
            title="Companii"
            path="/admin/companies"
            icon={<Building2 />}
            color="from-green-400 to-emerald-600"
          />
          <QuickLink
            title="Cererile"
            path="/admin/requests"
            icon={<ClipboardList />}
            color="from-yellow-400 to-orange-500"
          />
          <QuickLink
            title="Mesaje"
            path="/admin/messages"
            icon={<MessageSquare />}
            color="from-indigo-400 to-purple-600"
          />
          <QuickLink
            title="Plăți"
            path="/admin/payments"
            icon={<Coins />}
            color="from-emerald-500 to-sky-500"
          />
          <QuickLink
            title="Statistici"
            path="/admin/stats"
            icon={<FileDown />}
            color="from-blue-400 to-sky-500"
          />
          <QuickLink
            title="Recenzii"
            path="/admin/reviews"
            icon={<Star />}
            color="from-amber-400 to-orange-500"
          />
          <QuickLink
            title="Suport"
            path="/admin/support"
            icon={<Mail />}
            color="from-sky-400 to-blue-600"
          />
          <QuickLink
            title="Setări"
            path="/admin/settings"
            icon={<Settings />}
            color="from-gray-400 to-gray-600"
          />
          <QuickLink
            title="Generator"
            path="/admin/generator"
            icon={<Factory />}
            color="from-sky-400 to-indigo-600"
          />
          <QuickLink
            title="Jurnal Activitate"
            path="/admin/logs"
            icon={<Activity />}
            color="from-emerald-400 to-green-600"
          />
        </div>
      </motion.div>
    </AdminLayout>
  );
}

/* ---------- Reusable Components ---------- */
function StatCard({ title, value, icon, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-lg p-5 flex flex-col items-center justify-center`}
    >
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm mt-1">{title}</p>
    </motion.div>
  );
}

function ChartCard({ title, icon, children }: any) {
  return (
    <div className="bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-5">
      <h2 className="text-md font-semibold text-emerald-700 mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function QuickLink({ title, path, icon, color }: any) {
  return (
    <Link href={path}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`cursor-pointer bg-gradient-to-r ${color} text-white p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center transition`}
      >
        {icon}
        <p className="mt-2 font-semibold text-center text-sm">{title}</p>
      </motion.div>
    </Link>
  );
}
