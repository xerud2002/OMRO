"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Clock,
  User,
  Building2,
  Eye,
  Loader2,
} from "lucide-react";

export default function AdminMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/company/auth");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", u.uid));
      if (!userSnap.exists() || userSnap.data()?.role !== "admin") {
        router.push("/");
        return;
      }

      await loadAllConversations();
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // ✅ Load all requests + messages
  const loadAllConversations = async () => {
    const reqSnap = await getDocs(collection(db, "requests"));
    const data: any[] = [];

    for (const r of reqSnap.docs) {
      const reqData = r.data();
      const msgRef = collection(db, "requests", r.id, "messages");
      const msgSnap = await getDocs(query(msgRef, orderBy("createdAt", "asc")));

      if (msgSnap.docs.length > 0) {
        const lastMsg = msgSnap.docs[msgSnap.docs.length - 1].data();
        data.push({
          id: r.id,
          client: reqData.name || reqData.customerName || "Client necunoscut",
          company: reqData.assignedCompany || "Nicio companie",
          messages: msgSnap.docs.map((m) => ({ id: m.id, ...m.data() })),
          lastMessage: lastMsg.text || lastMsg.fileName || "(Fișier trimis)",
          lastDate: lastMsg.createdAt?.toDate
            ? lastMsg.createdAt.toDate().toLocaleString("ro-RO")
            : "-",
        });
      }
    }

    // Sort by last activity
    data.sort(
      (a, b) =>
        new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );

    setConversations(data);
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă conversațiile...
        </div>
      </AdminLayout>
    );

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-lg p-8 mt-8 mb-20"
        >
          <h1 className="text-3xl font-bold text-center text-emerald-700 mb-10 flex items-center justify-center gap-2">
            <MessageSquare size={26} /> Conversații client – companie
          </h1>

          {conversations.length === 0 ? (
            <p className="text-center text-gray-500">
              Nu există conversații încă.
            </p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-left">
                  <tr>
                    <th className="p-3 border-b">Client</th>
                    <th className="p-3 border-b">Companie</th>
                    <th className="p-3 border-b">Ultimul mesaj</th>
                    <th className="p-3 border-b">Data</th>
                    <th className="p-3 border-b text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-emerald-50 transition cursor-pointer"
                    >
                      <td className="p-3 border-b flex items-center gap-2">
                        <User size={16} className="text-emerald-600" />
                        {c.client}
                      </td>
                      <td className="p-3 border-b flex items-center gap-2">
                        <Building2 size={16} className="text-sky-600" />
                        {c.company}
                      </td>
                      <td className="p-3 border-b truncate max-w-[200px]">
                        {c.lastMessage}
                      </td>
                      <td className="p-3 border-b text-gray-500">
                        <Clock size={14} className="inline mr-1" />
                        {c.lastDate}
                      </td>
                      <td className="p-3 border-b text-center">
                        <button
                          onClick={() => setSelectedChat(c)}
                          className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Eye size={14} /> Vezi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === CHAT VIEWER MODAL === */}
          {selectedChat && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl p-6 relative">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h2 className="text-xl font-semibold text-emerald-700 mb-2">
                  Conversație #{selectedChat.id}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  👤 {selectedChat.client} &nbsp; | &nbsp; 🏢{" "}
                  {selectedChat.company}
                </p>

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 border-t border-b py-3">
                  {selectedChat.messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.sender === "company"
                          ? "ml-auto bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
                          : "mr-auto bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.text && <p>{msg.text}</p>}
                      {msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          className="underline text-xs mt-1 block"
                        >
                          📎 {msg.fileName}
                        </a>
                      )}
                      <span className="block text-[11px] opacity-70 mt-1">
                        {msg.createdAt?.toDate
                          ? msg.createdAt
                              .toDate()
                              .toLocaleString("ro-RO", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
