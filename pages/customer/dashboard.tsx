"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db, onAuthChange } from "../../utils/firebase";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import ClientLayout from "../../components/ClientLayout";
import { motion } from "framer-motion";
import {
  Loader2,
  FileText,
  User as UserIcon,
  MessageSquare,
  MapPinned,
  CalendarDays,
  Home,
  Building2,
  Edit,
  Trash2,
} from "lucide-react";

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState("orders");

  const statusColors: Record<string, string> = {
    "Nouă": "bg-blue-100 text-blue-800",
    "În lucru": "bg-yellow-100 text-yellow-800",
    "Finalizată": "bg-green-100 text-green-800",
  };

  // 🔹 Auth check
  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (!u) router.push("/customer/auth");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // 🔹 Load profile info
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  // 🔹 Load client orders
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      const q = query(collection(db, "requests"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        };
      });
      list.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
      setOrders(list);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  // ---------------- UI ----------------
  return (
    <ClientLayout>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-10"
      >
        {/* Welcome Banner */}
        <div className="rounded-3xl p-10 text-center text-white shadow-xl bg-gradient-to-r from-emerald-500 to-sky-500">
          <h2 className="text-3xl font-bold mb-2">
            Bun venit, {profile?.name || user.displayName || user.email} 👋
          </h2>
          <p className="text-emerald-50 text-sm">
            Urmărește cererile tale și comunică ușor cu firmele partenere.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8">
          {[
            { key: "orders", label: "Comenzile mele", icon: <FileText size={18} /> },
            { key: "profile", label: "Profil", icon: <UserIcon size={18} /> },
            { key: "messages", label: "Mesaje", icon: <MessageSquare size={18} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-2 font-medium text-sm sm:text-base transition-all ${
                tab === t.key
                  ? "border-b-2 border-emerald-600 text-emerald-700 scale-105"
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-10 text-emerald-600">
                <Loader2 className="animate-spin mr-2" /> Se încarcă comenzile...
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500">
                Nu ai trimis nicio cerere de mutare încă.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="rounded-3xl p-6 shadow-lg bg-white/80 backdrop-blur-md border border-emerald-100 transition-all hover:shadow-emerald-200 hover:scale-[1.02] flex flex-col justify-between h-full"
                  >
                    {/* Header */}
                    <div className="flex justify-between mb-2">
                      <h3 className="text-emerald-700 font-semibold">
                        {order.serviceType || "Mutare"} — {order.pickupCity} → {order.deliveryCity}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {order.createdAt ? order.createdAt.toLocaleDateString() : "-"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="text-sm text-gray-700 space-y-1 mb-3">
                      <p className="flex items-center gap-1">
                        <CalendarDays size={14} className="text-emerald-500" />
                        <strong>Data mutării:</strong> {order.moveDate || order.moveOption || "-"}
                      </p>
                      <p className="flex items-center gap-1">
                        <Building2 size={14} className="text-emerald-500" />
                        <strong>Dimensiune:</strong> {order.rooms || "-"}
                      </p>
                      <p className="flex items-center gap-1">
                        <Home size={14} className="text-emerald-500" />
                        <strong>Proprietate:</strong> {order.propertyType || "-"}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPinned size={14} className="text-emerald-500" />
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status || "Nouă"]
                          }`}
                        >
                          {order.status || "Nouă"}
                        </span>
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => router.push(`/form?id=${order.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 rounded-xl font-medium shadow hover:scale-[1.02] transition-all"
                      >
                        <Edit size={16} /> Editează
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Sigur vrei să ștergi această cerere?")) {
                            await deleteDoc(doc(db, "requests", order.id));
                            setOrders((p) => p.filter((o) => o.id !== order.id));
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-xl font-medium shadow hover:scale-[1.02] transition-all"
                      >
                        <Trash2 size={16} /> Șterge
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-8 bg-white/80 backdrop-blur-md shadow-lg text-center border border-emerald-100"
          >
            <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex justify-center items-center gap-2">
              <UserIcon size={20} /> Detalii profil
            </h2>
            <p><strong>Email:</strong> {profile?.email || user.email}</p>
            <p><strong>Nume:</strong> {profile?.name || user.displayName || "-"}</p>
            <p><strong>Telefon:</strong> {profile?.phone || "-"}</p>
          </motion.div>
        )}

        {/* MESSAGES TAB */}
        {tab === "messages" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-8 bg-white/80 backdrop-blur-md shadow-lg text-center border border-emerald-100"
          >
            <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex justify-center items-center gap-2">
              <MessageSquare size={20} /> Mesaje
            </h2>
            <p className="text-gray-600">
              📩 Aici vor apărea mesajele companiilor de mutări care răspund la cererile tale.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Sugestie: poți adăuga un mini-chat pentru fiecare comandă.
            </p>
          </motion.div>
        )}
      </motion.div>
    </ClientLayout>
  );
}
