"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[radial-gradient(circle_at_center,_#022c22,_#000)] text-gray-300 mt-24 overflow-hidden">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/patterns/mesh.svg')] opacity-10 bg-cover"></div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 sm:gap-10 z-10"
      >
        {/* Column 1: About */}
        <div>
          <div className="flex items-center mb-4 gap-3">
            <img
              src="/logo.png"
              alt="ofertemutare.ro"
              width={120}
              height={100}
              className="rounded-lg opacity-90"
            />
            
          </div>
          <p className="mt-2 text-gray-400 leading-relaxed text-sm max-w-xs">
            Platforma care conectează clienți și firme de mutări verificate din
            România. Rapid, sigur și transparent.
          </p>

          <div className="flex flex-col gap-1 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <PhoneCall size={16} />
              <span>+40 700 000 000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>contact@ofertemutare.ro</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>București, România</span>
            </div>
          </div>
        </div>

        {/* Column 2: Links */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">
            Linkuri utile
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/about", label: "Despre noi" },
              { href: "/contact", label: "Contact" },
              { href: "/customer/auth", label: "Autentificare client" },
              { href: "/company/auth", label: "Devino partener" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-emerald-300 transition-all duration-200 border-b border-transparent hover:border-emerald-400 pb-0.5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">
            Resurse
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/articles/tips", label: "Tips & Tricks mutare" },
              { href: "/faq", label: "Întrebări frecvente" },
              { href: "/guides/mutare", label: "Ghid complet de mutare" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-emerald-300 transition-all duration-200 border-b border-transparent hover:border-emerald-400 pb-0.5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Legal + Social */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-400 mb-4">Legal</h3>
          <ul className="space-y-2 text-sm mb-6">
            {[
              { href: "/terms", label: "Termeni și condiții" },
              { href: "/privacy", label: "Politica de confidențialitate" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-emerald-300 transition-all duration-200 border-b border-transparent hover:border-emerald-400 pb-0.5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4">
            {[
              { icon: <Facebook size={20} />, href: "#" },
              { icon: <Instagram size={20} />, href: "#" },
              { icon: <Linkedin size={20} />, href: "#" },
            ].map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/10 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-sky-500 transition-all duration-300 shadow-md"
              >
                {item.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sub-Footer */}
      <div className="relative border-t border-emerald-900/40 py-4 text-center text-gray-400 text-sm bg-black/40 backdrop-blur-md shadow-inner">
        © {new Date().getFullYear()}{" "}
        <span className="text-emerald-400 font-medium">ofertemutare.ro</span> ·
        Toate drepturile rezervate
      </div>
    </footer>
  );
};

export default Footer;
