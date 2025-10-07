"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { logout, db } from "../utils/firebase";
import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Shield,
  MessageSquare,
} from "lucide-react";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCompanies, setPendingCompanies] = useState<number>(0);
  const [newRequests, setNewRequests] = useState<number>(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [companiesSnap, requestsSnap] = await Promise.all([
          getDocs(collection(db, "companies")),
          getDocs(collection(db, "requests")),
        ]);

        const pending = companiesSnap.docs.filter(
          (c) => c.data().submittedForVerification && !c.data().verified
        ).length;

        const newReq = requestsSnap.docs.filter(
          (r) => r.data().status?.toLowerCase?.() === "noua"
        ).length;

        setPendingCompanies(pending);
        setNewRequests(newReq);
      } catch (err) {
        console.error("❌ Eroare la încărcarea badge-urilor admin:", err);
      }
    };

    fetchCounts();
  }, []);

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Companii", path: "/admin/companies", icon: <Building2 size={20} />, badge: pendingCompanies },
    { name: "Clienți", path: "/admin/clients", icon: <Users size={20} /> },
    { name: "Cererile", path: "/admin/requests", icon: <ClipboardList size={20} />, badge: newRequests },
    { name: "Mesaje", path: "/admin/messages", icon: <MessageSquare size={20} /> },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/company/auth");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-sky-50 text-gray-800">
      {/* === SIDEBAR === */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto md:min-h-screen w-64 bg-white/90 backdrop-blur-md shadow-lg flex flex-col justify-between rounded-r-3xl border-r border-emerald-100 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Header / Logo */}
          <div className="p-6 pb-4 text-2xl font-bold text-emerald-700 flex items-center justify-between border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-600" size={26} />
              <span>Admin Panel</span>
            </div>
            <button
              type="button"
              className="md:hidden text-gray-600 hover:text-emerald-700"
              onClick={() => setIsOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 space-y-1 px-3">
            {menu.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 font-semibold shadow-sm"
                      : "hover:bg-emerald-50 text-gray-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600">{item.icon}</span>
                    {item.name}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-emerald-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl py-2 font-medium shadow-md hover:scale-[1.03] transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* === MOBILE MENU BUTTON === */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 bg-gradient-to-r from-emerald-500 to-sky-500 text-white p-2 rounded-lg shadow-lg z-50"
      >
        <Menu size={22} />
      </button>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 min-h-screen p-6 md:p-10 md:ml-4 overflow-auto">
        {/* Header bar */}
        <div className="sticky top-0 z-10 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-emerald-100 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-emerald-700 tracking-tight">
            {pathname === "/admin/dashboard"
              ? "📊 Panou general"
              : pathname === "/admin/companies"
              ? "🏢 Gestionare companii"
              : pathname === "/admin/clients"
              ? "👥 Gestionare clienți"
              : pathname === "/admin/requests"
              ? "📦 Cereri clienți"
              : pathname === "/admin/messages"
              ? "💬 Mesaje"
              : "Admin Panel"}
          </h2>
        </div>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-[95%] mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
