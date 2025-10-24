"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AdminProtectedRoute from "../../../components/AdminProtectedRoute";
import AdminLayout from "../../../components/AdminLayout";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Building2,
  CalendarDays,
  Send,
  ClipboardList,
  Loader2,
} from "lucide-react";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupCity: "",
    pickupCounty: "",
    deliveryCity: "",
    deliveryCounty: "",
    propertyType: "",
    rooms: "",
    moveDate: "",
    details: "",
  });

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shortId = `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const requestRef = doc(collection(db, "requests"), shortId);

      // Main request without contact fields
      await setDoc(requestRef, {
        pickupCity: formData.pickupCity,
        pickupCounty: formData.pickupCounty,
        deliveryCity: formData.deliveryCity,
        deliveryCounty: formData.deliveryCounty,
        propertyType: formData.propertyType,
        rooms: formData.rooms,
        moveDate: formData.moveDate,
        details: formData.details,
        createdAt: Timestamp.now(),
        status: "Nouă",
        requestId: shortId,
        userId: "admin-created", // optional marker
      });

      // Contact protected subdoc
      await setDoc(doc(requestRef, "contact", "info"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        createdAt: Timestamp.now(),
      });

      toast.success("✅ Cererea a fost adăugată cu succes!");
      router.push("/admin/requests");
    } catch (err) {
      console.error(err);
      toast.error("❌ Eroare la salvarea cererii!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          <h1 className="text-2xl font-bold text-emerald-700 mb-8 flex items-center gap-2">
            <ClipboardList size={24} /> Creează cerere nouă
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Client info (stored in contact subdoc) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <User size={14} className="inline mr-1" /> Nume client
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: Andrei Popescu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Mail size={14} className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: client@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Phone size={14} className="inline mr-1" /> Telefon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                placeholder="07XXXXXXXX"
              />
            </div>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <MapPin size={14} className="inline mr-1" /> Oraș colectare
                </label>
                <input
                  type="text"
                  value={formData.pickupCity}
                  onChange={(e) => handleChange("pickupCity", e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: Cluj-Napoca"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Building2 size={14} className="inline mr-1" /> Județ colectare
                </label>
                <input
                  type="text"
                  value={formData.pickupCounty}
                  onChange={(e) => handleChange("pickupCounty", e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: Cluj"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <MapPin size={14} className="inline mr-1" /> Oraș livrare
                </label>
                <input
                  type="text"
                  value={formData.deliveryCity}
                  onChange={(e) => handleChange("deliveryCity", e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: București"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Building2 size={14} className="inline mr-1" /> Județ livrare
                </label>
                <input
                  type="text"
                  value={formData.deliveryCounty}
                  onChange={(e) => handleChange("deliveryCounty", e.target.value)}
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: Ilfov"
                />
              </div>
            </div>

            {/* Property */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Home size={14} className="inline mr-1" /> Tip proprietate
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  required
                >
                  <option value="">Selectează...</option>
                  <option value="Casă">Casă</option>
                  <option value="Apartament">Apartament</option>
                  <option value="Office">Office</option>
                  <option value="Depozit">Depozit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Building2 size={14} className="inline mr-1" /> Număr camere
                </label>
                <input
                  type="text"
                  value={formData.rooms}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ex: 3 camere"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <CalendarDays size={14} className="inline mr-1" /> Data mutării
              </label>
              <input
                type="date"
                value={formData.moveDate}
                onChange={(e) => handleChange("moveDate", e.target.value)}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl py-2 font-medium shadow-md hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? "Se salvează..." : "Adaugă cererea"}
              </button>
            </div>
          </form>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
