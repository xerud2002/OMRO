"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { db, onAuthChange } from "@/services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import ClientLayout from "../../components/layouts/ClientLayout";
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
  BugPlay,
} from "lucide-react";
import { testFirebaseConnection } from "@/dev/testConnection";
import toast from "react-hot-toast";

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState("orders");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState("");

  const statusColors: Record<string, string> = {
    Nouă: "bg-blue-100 text-blue-800",
    "În lucru": "bg-yellow-100 text-yellow-800",
    Finalizată: "bg-green-100 text-green-800",
  };

  // 🔐 Auth
  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (!u) router.push("/customer/auth");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // 🔹 Profile
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  // 🔹 Orders
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "requests"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.seconds
            ? new Date(d.data().createdAt.seconds * 1000)
            : null,
        }));
        list.sort(
          (a, b) =>
            (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
        );
        setOrders(list);
      } catch (err) {
        console.error("Eroare la citirea comenzilor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // 🔍 Run Firebase test
  const handleTest = async () => {
    if (testing) return;
    setTesting(true);
    setTestResult("⏳ Se verifică conexiunea...");
    try {
      const result = await testFirebaseConnection();
      setTestResult(result);
      if (result.includes("✅")) toast.success("Conexiune funcțională!");
      else toast.error("Testul a eșuat!");
    } catch (err) {
      console.error(err);
      toast.error("Eroare la testarea conexiunii.");
    } finally {
      setTesting(false);
    }
  };

  if (!user) return null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Acasă",
        item: "https://ofertemutare.ro",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cont client",
        item: "https://ofertemutare.ro/customer/dashboard",
      },
    ],
  };

  return (
    <ClientLayout>
      <Head>
        <title>Panou client | ofertemutare.ro</title>
        <meta
          name="description"
          content="Panou personalizat pentru clienții ofertemutare.ro. Vizualizează cererile de mutare, profilul și comunicările cu firmele de mutări."
        />
        <meta name="robots" content="noindex, nofollow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-10 pb-20"
      >
        {/* 🌿 Welcome */}
        <div className="text-center bg-gradient-to-r from-emerald-500 via-emerald-600 to-sky-500 rounded-3xl py-12 px-6 shadow-xl text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Bun venit, {profile?.name || user.displayName || user.email} 👋
          </h2>
          <p className="text-emerald-50 text-sm">
            Urmărește cererile tale și comunică ușor cu firmele partenere.
          </p>
          <div className="h-0.5 w-24 mx-auto mt-3 bg-white/50 rounded-full" />
        </div>

        {/* 🌈 Tabs */}
        <div className="flex justify-center gap-6 sm:gap-10 flex-wrap">
          {[
            { key: "orders", label: "Comenzile mele", icon: <FileText size={18} /> },
            { key: "profile", label: "Profil", icon: <UserIcon size={18} /> },
            { key: "messages", label: "Mesaje", icon: <MessageSquare size={18} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-2 font-medium text-sm sm:text-base transition-all border-b-2 ${
                tab === t.key
                  ? "border-emerald-500 text-emerald-700 scale-105"
                  : "border-transparent text-gray-500 hover:text-emerald-600"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* 🗂 ORDERS */}
        {tab === "orders" && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-10 text-emerald-600">
                <Loader2 className="animate-spin mr-2" /> Se încarcă comenzile...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-2">Nu ai trimis nicio cerere de mutare încă.</p>
                <button
                  onClick={() => router.push("/form")}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Trimite o cerere nouă acum →
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch px-4 sm:px-6">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="rounded-3xl p-6 shadow-md bg-white/80 backdrop-blur-md border border-emerald-100 transition-all hover:shadow-emerald-200 hover:-translate-y-1 flex flex-col justify-between h-full"
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="text-emerald-700 font-semibold text-sm sm:text-base">
                        {order.serviceType || "Mutare"} — {order.pickupCity} →{" "}
                        {order.deliveryCity}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {order.createdAt ? order.createdAt.toLocaleDateString() : "-"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1 mb-4">
                      <p className="flex items-center gap-1">
                        <CalendarDays size={14} className="text-emerald-500" />
                        <strong>Data mutării:</strong> {order.moveDate || "-"}
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

                    <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                      <button
                        onClick={() => router.push(`/customer/${order.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-2 rounded-full font-medium shadow hover:scale-[1.03] transition-all"
                      >
                        <MessageSquare size={16} /> Detalii
                      </button>

                      <button
                        onClick={() => router.push(`/form?id=${order.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2 rounded-full font-medium shadow hover:scale-[1.03] transition-all"
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
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-full font-medium shadow hover:scale-[1.03] transition-all"
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

        {/* 👤 PROFILE + Test Firebase */}
        {tab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-8 bg-white/90 backdrop-blur-md shadow-lg text-center border border-emerald-100 max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-xl font-semibold text-emerald-700 mb-2 flex justify-center items-center gap-2">
              <UserIcon size={20} /> Detalii profil
            </h2>
            <p><strong>Email:</strong> {profile?.email || user.email}</p>
            <p><strong>Nume:</strong> {profile?.name || user.displayName || "-"}</p>
            <p><strong>Telefon:</strong> {profile?.phone || "-"}</p>

            <div className="pt-6 border-t border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-700 flex justify-center items-center gap-2 mb-4">
                <BugPlay size={18} /> Test conexiune Firebase
              </h3>
              <button
                onClick={handleTest}
                disabled={testing}
                className={`px-6 py-2 rounded-full font-medium shadow-md transition-all ${
                  testing
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:scale-105"
                }`}
              >
                {testing ? "Se verifică..." : "Rulează testul 🔍"}
              </button>
              {testResult && (
                <p
                  className={`mt-4 text-sm font-medium ${
                    testResult.includes("✅") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {testResult}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* 💬 MESSAGES */}
        {tab === "messages" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-8 bg-white/90 backdrop-blur-md shadow-lg text-center border border-emerald-100 max-w-2xl mx-auto"
          >
            <h2 className="text-xl font-semibold text-emerald-700 mb-4 flex justify-center items-center gap-2">
              <MessageSquare size={20} /> Mesaje
            </h2>
            <p className="text-gray-600">
              📩 Aici vor apărea mesajele companiilor care răspund la cererile tale.
            </p>
          </motion.div>
        )}
      </motion.div>
    </ClientLayout>
  );
}
