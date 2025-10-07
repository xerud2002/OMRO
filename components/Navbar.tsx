"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X, PhoneCall } from "lucide-react";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for background change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        
        {/* Logo bazat pe imaginea finală */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png" // Vă rugăm să vă asigurați că această cale și nume de fișier sunt corecte!
            alt="OFERTE MUTARE Logo"
            width={180} 
            height={40} 
            priority
          />
        </Link>
        {/* Sfârșit Logo */}

        {/* Desktop Nav */}
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
          <Link
            href="/form"
            className="ml-3 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <PhoneCall size={18} /> Obține Oferte
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Închide meniul" : "Deschide meniul"}
          className="md:hidden p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg border-t border-emerald-100"
        >
          <nav className="flex flex-col px-6 py-4 space-y-2">
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
            <Link
              href="/form"
              onClick={() => setIsOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <PhoneCall size={18} /> Obține Oferte
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;