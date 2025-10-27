"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PhoneCall, LogOut, User, LayoutDashboard } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange, logout } from "@/config/firebaseConfig";
import { User as FirebaseUser } from "firebase/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsub = onAuthChange(setUser);
    return () => unsub();
  }, []);

  const handleGetOffers = () => {
    if (user) router.push("/form");
    else {
      localStorage.setItem("redirectAfterLogin", "form");
      router.push("/customer/auth");
    }
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowUserMenu(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/about", label: "Despre Noi" },
    { href: "/contact", label: "Contact" },
    { href: "/company/auth", label: "Devino Partener" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-md border-b border-emerald-100"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        <Link href="/" aria-label="Acasă" className="flex items-center space-x-2 select-none">
          <Image
            src="/logo.png"
            alt="ofertemutare.ro"
            width={180}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                pathname === link.href
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-gray-700 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!user ? (
            <button
              onClick={handleGetOffers}
              aria-label="Cont Client"
              className="ml-3 inline-flex items-center gap-2 px-5 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-500 to-sky-500 shadow-md hover:shadow-lg hover:scale-[1.04] transition-all"
            >
              <PhoneCall size={18} /> Cont Client
            </button>
          ) : (
            <div className="relative ml-3">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                aria-haspopup="true"
                aria-expanded={showUserMenu}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow-md hover:scale-[1.04] transition-all"
              >
                <User size={18} />
                {user.email?.split("@")[0]}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 mt-2 w-44 bg-white border border-emerald-100 rounded-xl shadow-lg overflow-hidden z-50"
                  >
                    <Link
                      href="/customer/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-emerald-50 transition-all"
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-gray-700 hover:bg-emerald-50 transition-all"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
          className="md:hidden p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-t border-emerald-100 shadow-lg"
          >
            <div className="flex flex-col px-6 py-4 space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                    pathname === item.href
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <button
                onClick={handleGetOffers}
                className="mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <PhoneCall size={18} /> Obține Oferte
              </button>

              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-2 mt-3 text-gray-700 border border-gray-200 rounded-full hover:bg-emerald-50 transition-all"
                >
                  <LogOut size={18} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
