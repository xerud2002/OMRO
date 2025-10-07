"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db, onAuthChange, logout } from "../utils/firebase";
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { User } from "firebase/auth";

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

  // Auth check
  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (!u) router.push("/auth");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  // Load profile info
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  // Load client orders
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

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Panou Client</h1>
          <button
            onClick={logout}
            className="bg-white text-green-700 px-3 py-1 rounded hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Profile Welcome */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">
            Bun venit, {profile?.name || user.displayName || user.email} 👋
          </h2>
          <p className="text-gray-600">
            Aici poți urmări cererile tale de mutare și stadiul fiecăreia.
          </p>
        </div>

        {/* TABS */}
        <div className="flex justify-center gap-6 mb-8">
          {["orders", "profile", "messages"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 font-medium ${
                tab === t ? "border-b-2 border-green-600 text-green-700" : "text-gray-600"
              }`}
            >
              {t === "orders" && "🧾 Comenzile mele"}
              {t === "profile" && "👤 Profil"}
              {t === "messages" && "💬 Mesaje"}
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {tab === "orders" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-green-700 text-center">
              Comenzile tale
            </h2>

            {loading ? (
              <p className="text-center text-gray-500">Se încarcă comenzile...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500">
                Nu ai trimis nicio cerere de mutare încă.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-green-700">
                        {order.serviceType || "Mutare"} —{" "}
                        {order.pickupCity} → {order.deliveryCity}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {order.createdAt
                          ? order.createdAt.toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Data mutării:</strong> {order.moveDate || order.moveOption || "-"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Dimensiune:</strong> {order.rooms || "-"}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      <strong>Proprietate:</strong> {order.propertyType || "-"}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <strong>Status:</strong>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status || "Nouă"]
                        }`}
                      >
                        {order.status || "Nouă"}
                      </span>
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => router.push(`/form?id=${order.id}`)}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                      >
                        ✏️ Editează
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Sigur vrei să ștergi această cerere?")) {
                            await deleteDoc(doc(db, "requests", order.id));
                            setOrders((p) => p.filter((o) => o.id !== order.id));
                          }
                        }}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                      >
                        🗑️ Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Detalii profil</h2>
            <p><strong>Email:</strong> {profile?.email || user.email}</p>
            <p><strong>Nume:</strong> {profile?.name || user.displayName || "-"}</p>
            <p><strong>Telefon:</strong> {profile?.phone || "-"}</p>
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab === "messages" && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Mesaje de la companii</h2>
            <p className="text-gray-600">
              📩 Aici vor apărea mesajele companiilor de mutări care răspund la cererile tale.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Sugestie: poți adăuga un mini-chat pentru fiecare comandă.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
