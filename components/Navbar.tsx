"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "../utils/firebase";
import { User } from "firebase/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // 🔹 Detect scroll for background transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Track logged-in user
  useEffect(() => {
    const unsub = onAuthChange(setUser);
    return () => unsub();
  }, []);

  // 🔹 Redirect logic for “Obține Oferte”
  const handleGetOffers = () => {
    if (user) {
      router.push("/form");
    } else {
      localStorage.setItem("redirectAfterLogin", "form");
      router.push("/customer/auth");
    }
    setIsOpen(false); // close mobile menu if open
  };

  // 🔹 Navigation links
  const navLinks = [
    { href: "/about", label: "Despre Noi" },
    { href: "/contact", label: "Contact" },
    { href: "/company/auth", label: "Devino Partener" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-md"
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* === LOGO === */}
        <Link
          href="/"
          className="flex items-center space-x-2"
          title="Acasă - ofertemutare.ro"
          aria-label="Acasă"
        >
          <Image
            src="/logo.png"
            alt="ofertemutare.ro Logo"
            width={180}
            height={40}
            priority
            className="object-contain"
          />
        </Link>

        {/* === DESKTOP NAV === */}
        <nav className="hidden md:flex items-center space-x-4">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-gray-700 font-medium rounded-full hover:text-emerald-700 hover:bg-emerald-50 transition-all"
            >
              {item.label}
            </Link>
          ))}

          {/* CTA: Obține Oferte */}
          <button
            onClick={handleGetOffers}
            className="ml-3 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <PhoneCall size={18} />
            Cont Client
          </button>
        </nav>

        {/* === MOBILE MENU BUTTON === */}
        <button
          type="button"
          aria-label={isOpen ? "Închide meniul" : "Deschide meniul"}
          title={isOpen ? "Închide meniul" : "Deschide meniul"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* === MOBILE MENU === */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg border-t border-emerald-100"
          >
            <div className="flex flex-col px-6 py-4 space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gradient-to-r hover:from-emerald-500 hover:to-sky-500 hover:text-white transition-all"
                >
                  {item.label}
                </Link>
              ))}

              {/* CTA Mobile */}
              <button
                onClick={handleGetOffers}
                className="mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <PhoneCall size={18} />
                Obține Oferte
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
