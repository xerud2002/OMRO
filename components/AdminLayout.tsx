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
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
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
  const [newMessages, setNewMessages] = useState<number>(0);

  // 🔹 Fetch counts (companies pending, new requests, recent messages)
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

        // 🔹 Count requests that have messages in last 48h (for badge)
        let recentMessagesCount = 0;
        for (const r of requestsSnap.docs) {
          const msgs = r.data()?.messagesLastUpdated;
          if (
            msgs &&
            new Date(msgs.toDate ? msgs.toDate() : msgs).getTime() >
              Date.now() - 1000 * 60 * 60 * 48
          ) {
            recentMessagesCount++;
          }
        }

        setPendingCompanies(pending);
        setNewRequests(newReq);
        setNewMessages(recentMessagesCount);
      } catch (err) {
        console.error("❌ Eroare la încărcarea badge-urilor admin:", err);
      }
    };

    fetchCounts();
  }, []);

  // 🔹 Admin navigation menu
  const menu = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Companii",
      path: "/admin/companies",
      icon: <Building2 size={20} />,
      badge: pendingCompanies,
    },
    {
      name: "Clienți",
      path: "/admin/clients",
      icon: <Users size={20} />,
    },
    {
      name: "Cererile",
      path: "/admin/requests",
      icon: <ClipboardList size={20} />,
      badge: newRequests,
    },
    {
      name: "Mesaje",
      path: "/admin/messages",
      icon: <MessageSquare size={20} />,
      badge: newMessages,
    },
  ];

  // 🔹 Logout handler
  const handleLogout = async () => {
    await logout();
    router.push("/company/auth");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-sky-50 text-gray-800">
      {/* === SIDEBAR === */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-xl shadow-xl flex flex-col justify-between rounded-r-3xl border-r border-emerald-100 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* --- Sidebar Top --- */}
        <div>
          {/* --- Header / Logo --- */}
          <div className="p-6 text-2xl font-bold text-emerald-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="text-emerald-600" size={26} />
              <span>Admin Panel</span>
            </div>
            <button
              type="button"
              title="Închide meniul"
              aria-label="Închide meniul"
              className="md:hidden text-gray-600 hover:text-emerald-700"
              onClick={() => setIsOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          {/* --- Navigation --- */}
          <nav className="mt-4 space-y-1">
            {menu.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between py-3 px-6 rounded-l-full transition-all duration-200 ${
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
                    <span
                      className="ml-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      aria-label={`Număr ${item.name.toLowerCase()}: ${item.badge}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* --- Logout Button --- */}
        <div className="p-6 border-t border-emerald-100">
          <button
            type="button"
            title="Deconectare"
            aria-label="Deconectare"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl py-2 font-medium shadow-md hover:scale-[1.03] transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* === MOBILE MENU TOGGLE === */}
      <button
        type="button"
        title="Deschide meniul"
        aria-label="Deschide meniul"
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 bg-gradient-to-r from-emerald-500 to-sky-500 text-white p-2 rounded-lg shadow-lg z-50"
      >
        <Menu size={22} />
      </button>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-6 md:p-10 w-full overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
