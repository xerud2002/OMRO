"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "../utils/firebase";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Client navigation
  const menu = [
    {
      name: "Dashboard",
      path: "/customer/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Profil",
      path: "/customer/profile",
      icon: <User size={20} />,
    },
    {
      name: "Mesaje",
      path: "/customer/messages",
      icon: <MessageSquare size={20} />,
    },
  ];

  // 🔹 Logout with confirmation
  const handleLogout = async () => {
    if (confirm("Sigur vrei să te deconectezi?")) {
      await logout();
      router.push("/customer/auth");
    }
  };

  // 🔹 Path match helper
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-sky-50 text-gray-800">
      {/* === SIDEBAR === */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl flex flex-col justify-between rounded-r-3xl border-r border-emerald-100 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* --- Top Section --- */}
        <div>
          {/* --- Logo --- */}
          <div className="p-6 pb-4 text-2xl font-bold text-emerald-700 flex items-center justify-between border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <Home className="text-emerald-600" size={26} />
              <span>ofertemutare.ro</span>
            </div>
            <button
              type="button"
              title="Închide meniul"
              aria-label="Închide meniul"
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-600 hover:text-emerald-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* --- New Request CTA --- */}
          <div className="px-6 mt-4 mb-6 text-center">
            <Link
              href="/form"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-4 py-2 rounded-2xl shadow-md hover:scale-[1.03] transition-all font-medium"
            >
              <PlusCircle size={18} />
              <span>Comandă nouă</span>
            </Link>
          </div>

          {/* --- Menu Items --- */}
          <nav className="mt-2">
            {menu.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-6 rounded-l-full transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 font-semibold shadow-sm"
                      : "hover:bg-emerald-50 text-gray-700"
                  }`}
                >
                  <span className="text-emerald-600">{item.icon}</span>
                  {item.name}
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
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-emerald-700 tracking-tight">
            {pathname.startsWith("/customer/dashboard")
              ? "📦 Panou general"
              : pathname.startsWith("/customer/profile")
              ? "👤 Profilul tău"
              : pathname.startsWith("/customer/messages")
              ? "💬 Mesajele tale"
              : "Contul tău"}
          </h2>
        </div>

        {/* Animated Page Content */}
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
