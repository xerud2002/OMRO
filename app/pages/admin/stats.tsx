"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LineChart,
  Line,
} from "recharts";
import toast from "react-hot-toast";
import {
  BarChart3,
  Building2,
  Users,
  ClipboardList,
  Coins,
  FileDown,
  MapPin,
  Loader2,
  TrendingUp,
  Sparkles,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

export default function AdminStatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // --- Load all data ---
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      try {
        const [reqSnap, compSnap, paySnap, userSnap] = await Promise.all([
          getDocs(collection(db, "requests")),
          getDocs(collection(db, "companies")),
          getDocs(collection(db, "payments")),
          getDocs(collection(db, "users")),
        ]);

        setRequests(reqSnap.docs.map((d) => d.data()));
        setCompanies(compSnap.docs.map((d) => d.data()));
        setPayments(paySnap.docs.map((d) => d.data()));
        setClients(userSnap.docs.map((d) => d.data()));
      } catch (err) {
        toast.error("Eroare la încărcarea datelor!");
        console.error(err);
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
          <Loader2 className="animate-spin mr-2" /> Se încarcă statistici...
        </div>
      </AdminLayout>
    );

  // --- Compute KPIs ---
  const totalRevenue = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );
  const verifiedCompanies = companies.filter((c) => c.verified).length;
  const totalRequests = requests.length;
  const activeClients = clients.length;

  // --- Requests per week ---
  const weekCounts: Record<string, number> = {};
  requests.forEach((r) => {
    if (r.createdAt?.seconds) {
      const date = new Date(r.createdAt.seconds * 1000);
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
    }
  });
  const weeklyData = Object.keys(weekCounts).map((k) => ({
    week: k,
    requests: weekCounts[k],
  }));

  // --- Revenue by month ---
  const monthlyRevenue: Record<string, number> = {};
  payments.forEach((p) => {
    if (p.createdAt?.seconds) {
      const date = new Date(p.createdAt.seconds * 1000);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyRevenue[monthKey] =
        (monthlyRevenue[monthKey] || 0) + (parseFloat(p.amount) || 0);
    }
  });
  const revenueData = Object.entries(monthlyRevenue).map(([k, v]) => ({
    month: k,
    revenue: v,
  }));

  // --- Top companies ---
  const companyPayments: Record<string, number> = {};
  payments.forEach((p) => {
    if (p.companyName) {
      companyPayments[p.companyName] =
        (companyPayments[p.companyName] || 0) + (parseFloat(p.amount) || 0);
    }
  });
  const topCompanies = Object.entries(companyPayments)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // --- Requests by county ---
  const countyCount: Record<string, number> = {};
  requests.forEach((r) => {
    if (r.pickupCounty)
      countyCount[r.pickupCounty] = (countyCount[r.pickupCounty] || 0) + 1;
  });
  const countyData = Object.entries(countyCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // --- Recent activity ---
  const recentRequests = requests
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5);
  const recentCompanies = companies
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5);

  // --- CSV Export ---
  const exportCSV = () => {
    const header = "Date,Requests,Revenue,Companies\n";
    const rows = revenueData
      .map((r) => `${r.month},${r.revenue || 0},${totalRequests},${verifiedCompanies}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
  };

  // --- Colors ---
  const colors = ["#10B981", "#60A5FA", "#38BDF8", "#F59E0B", "#F87171"];

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <BarChart3 size={26} /> Statistici & Analize
            </h1>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-sm font-medium shadow-md hover:scale-[1.03] transition"
            >
              <FileDown size={16} /> Export CSV
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "Total Cereri",
                value: totalRequests,
                icon: ClipboardList,
                color: "emerald",
              },
              {
                title: "Companii Verificate",
                value: verifiedCompanies,
                icon: Building2,
                color: "sky",
              },
              {
                title: "Clienți Activi",
                value: activeClients,
                icon: Users,
                color: "amber",
              },
              {
                title: "Venit Total (RON)",
                value: totalRevenue.toFixed(2),
                icon: Coins,
                color: "emerald",
              },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 p-5 rounded-2xl shadow-sm flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <Icon size={20} />
                    <p className="text-sm font-medium text-gray-700">{kpi.title}</p>
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700">{kpi.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Requests Trend */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow p-6">
              <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <TrendingUp size={18} /> Cereri Săptămânale
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow p-6">
              <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <Sparkles size={18} /> Venit Lunar
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#38BDF8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Companies + Counties */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl border border-emerald-100 shadow p-6">
              <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <Building2 size={18} /> Top Companii (Lead-uri)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topCompanies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60A5FA" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-100 shadow p-6">
              <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <MapPin size={18} /> Cele mai active județe
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={countyData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {countyData.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Requests */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow p-6">
              <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <ClipboardList size={18} /> Cereri recente
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {recentRequests.map((r, i) => (
                  <li
                    key={i}
                    className="border-b border-gray-100 pb-2 flex justify-between"
                  >
                    <span>
                      {r.name || "Client necunoscut"} — {r.pickupCity} → {r.deliveryCity}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {r.createdAt?.seconds
                        ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("ro-RO")
                        : "-"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Companies */}
            <div className="bg-white rounded-2xl border border-emerald-100 shadow p-6">
              <h3 className="font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                <Building2 size={18} /> Companii noi
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {recentCompanies.map((c, i) => (
                  <li
                    key={i}
                    className="border-b border-gray-100 pb-2 flex justify-between"
                  >
                    <span>{c.name || "Fără nume"} — {c.email}</span>
                    <span className="text-gray-500 text-xs">
                      {c.createdAt?.seconds
                        ? new Date(c.createdAt.seconds * 1000).toLocaleDateString("ro-RO")
                        : "-"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
