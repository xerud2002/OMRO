"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Search,
  Loader2,
  Mail,
  Building2,
  User,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  FileDown,
  Eye,
  MessageCircle,
  StickyNote,
} from "lucide-react";

export default function AdminSupportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      try {
        const reqSnap = await getDocs(collection(db, "requests"));
        const all = [];

        for (const docReq of reqSnap.docs) {
          const reqData = docReq.data();
          const msgRef = collection(db, "requests", docReq.id, "messages");
          const msgSnap = await getDocs(query(msgRef, orderBy("createdAt", "asc")));

          if (msgSnap.docs.length > 0) {
            const messages = msgSnap.docs.map((m) => m.data());
            const lastMsg = messages[messages.length - 1];
            all.push({
              id: docReq.id,
              client: reqData.name || reqData.customerName || "Client necunoscut",
              company: reqData.assignedCompany || "Nicio companie",
              messages,
              lastMessage: lastMsg.text || "(Fișier trimis)",
              lastDate: lastMsg.createdAt?.seconds
                ? new Date(lastMsg.createdAt.seconds * 1000).toLocaleString("ro-RO")
                : "-",
              status: reqData.status || "noua",
            });
          }
        }

        // sort by last message
        all.sort(
          (a, b) =>
            new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
        );
        setConversations(all);
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea conversațiilor!");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConv) return;
    const msgRef = collection(db, "requests", selectedConv.id, "messages");

    await addDoc(msgRef, {
      text: replyText,
      sender: "admin",
      createdAt: new Date(),
    });

    toast.success("💬 Mesaj trimis!");
    setReplyText("");
    setSelectedConv((prev: any) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { text: replyText, sender: "admin", createdAt: new Date() },
      ],
    }));
  };

  const exportConversation = (conv: any) => {
    const header = "Date,Sender,Message\n";
    const rows = conv.messages
      .map(
        (m: any) =>
          `${m.createdAt?.seconds
            ? new Date(m.createdAt.seconds * 1000).toLocaleString("ro-RO")
            : "-"
          },${m.sender},${m.text.replace(/\n/g, " ")}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation_${conv.id}.csv`;
    a.click();
  };

  const filtered = conversations.filter((c) => {
    const matchesFilter = filter ? c.status === filter : true;
    const matchesSearch =
      c.client.toLowerCase().includes(search) ||
      c.company.toLowerCase().includes(search);
    return matchesFilter && (!search || matchesSearch);
  });

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
          className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
              <MessageSquare size={26} /> Mesaje & Suport
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Clock size={20} /> Conversații active
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Caută client, companie..."
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400"
                  onChange={(e) => setSearch(e.target.value.toLowerCase())}
                />
              </div>
              <select
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400"
              >
                <option value="">Toate</option>
                <option value="noua">Nouă</option>
                <option value="in_interes">În interes</option>
                <option value="finalizata">Finalizată</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white/90">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Client</th>
                  <th className="p-3 border-b">Companie</th>
                  <th className="p-3 border-b">Ultimul mesaj</th>
                  <th className="p-3 border-b">Dată</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
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
                    <td className="p-3 border-b text-gray-500 text-xs">
                      {c.lastDate}
                    </td>
                    <td className="p-3 border-b text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          c.status === "finalizata"
                            ? "bg-green-100 text-green-700"
                            : c.status === "in_interes"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 border-b text-center">
                      <button
                        onClick={() => setSelectedConv(c)}
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

          {/* Chat Modal */}
          {selectedConv && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl p-6 relative">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h2 className="text-xl font-semibold text-emerald-700 mb-2">
                  Conversație #{selectedConv.id}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  👤 {selectedConv.client} &nbsp; | &nbsp; 🏢{" "}
                  {selectedConv.company}
                </p>

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 border-t border-b py-3">
                  {selectedConv.messages.map((msg: any, i: number) => (
                    <div
                      key={i}
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.sender === "company"
                          ? "ml-auto bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
                          : msg.sender === "admin"
                          ? "mx-auto bg-gray-200 text-gray-900 italic text-center"
                          : "mr-auto bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[11px] opacity-70 mt-1">
                        {msg.createdAt?.seconds
                          ? new Date(
                              msg.createdAt.seconds * 1000
                            ).toLocaleString("ro-RO", {
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

                <div className="mt-4 flex gap-2">
                  <textarea
                    placeholder="Scrie un mesaj ca Admin..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 border rounded-xl p-2 focus:ring-2 focus:ring-emerald-400"
                    rows={2}
                  />
                  <button
                    onClick={handleSendReply}
                    className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl px-4 flex items-center justify-center hover:scale-[1.03] transition"
                  >
                    <Send size={18} />
                  </button>
                </div>

                <button
                  onClick={() => exportConversation(selectedConv)}
                  className="mt-3 text-xs text-gray-500 underline flex items-center gap-1"
                >
                  <FileDown size={12} /> Exportă conversația
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
