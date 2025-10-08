"use client";
import { useEffect, useState } from "react";
import { db, onAuthChange } from "../../utils/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Edit3,
  Search,
  Building2,
  FileDown,
  MessageCircle,
  ThumbsDown,
} from "lucide-react";

export default function AdminReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load reviews
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) return router.push("/company/auth");

      try {
        const snap = await getDocs(collection(db, "reviews"));
        const allReviews = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        allReviews.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setReviews(allReviews);
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea recenziilor!");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // Update review status
  const updateStatus = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, "reviews", id), { status });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      toast.success(
        status === "approved"
          ? "✅ Recenzie aprobată!"
          : "❌ Recenzie respinsă!"
      );
    } catch {
      toast.error("Eroare la actualizarea statusului!");
    } finally {
      setProcessingId(null);
    }
  };

  // Delete review
  const handleDelete = async (id: string) => {
    if (!confirm("Sigur vrei să ștergi această recenzie?")) return;
    setProcessingId(id);
    await deleteDoc(doc(db, "reviews", id));
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setProcessingId(null);
    toast.success("🗑️ Recenzie ștearsă!");
  };

  // Reply to review
  const handleReply = async (id: string) => {
    if (!replyText.trim()) return toast.error("Scrie un răspuns înainte!");
    await updateDoc(doc(db, "reviews", id), { adminReply: replyText });
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, adminReply: replyText } : r))
    );
    toast.success("💬 Răspuns trimis!");
    setReplyText("");
    setSelectedReview(null);
  };

  // Export CSV
  const exportCSV = () => {
    const header = "Company,Client,Rating,Review,Status,Date\n";
    const rows = reviews
      .map(
        (r) =>
          `${r.companyName || "-"},${r.clientName || "-"},${r.rating || 0},"${
            r.text || ""
          }",${r.status || "-"},${
            r.createdAt?.seconds
              ? new Date(r.createdAt.seconds * 1000).toLocaleDateString("ro-RO")
              : "-"
          }`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reviews.csv";
    a.click();
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
          <Loader2 className="animate-spin mr-2" /> Se încarcă recenziile...
        </div>
      </AdminLayout>
    );

  // Filters
  const filtered = reviews.filter((r) => {
    const matchesFilter = filter ? r.status === filter : true;
    const matchesSearch =
      r.companyName?.toLowerCase().includes(search) ||
      r.clientName?.toLowerCase().includes(search) ||
      r.text?.toLowerCase().includes(search);
    return matchesFilter && (!search || matchesSearch);
  });

  const averageRating =
    filtered.length > 0
      ? (filtered.reduce((sum, r) => sum + (r.rating || 0), 0) /
          filtered.length).toFixed(1)
      : "0.0";

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
              <Star size={26} /> Recenzii & Moderare
            </h1>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl text-sm font-medium shadow-md hover:scale-[1.03] transition"
            >
              <FileDown size={16} /> Export CSV
            </button>
          </div>

          {/* Overview */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-gray-600 text-sm">Total Recenzii</p>
              <h2 className="text-2xl font-bold text-emerald-700">
                {reviews.length}
              </h2>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
              <p className="text-gray-600 text-sm">În așteptare</p>
              <h2 className="text-2xl font-bold text-amber-700">
                {reviews.filter((r) => r.status === "pending").length}
              </h2>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 shadow-sm">
              <p className="text-gray-600 text-sm">Aprobate</p>
              <h2 className="text-2xl font-bold text-emerald-700">
                {reviews.filter((r) => r.status === "approved").length}
              </h2>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-rose-50 p-5 rounded-2xl border border-red-100 shadow-sm">
              <p className="text-gray-600 text-sm">Scor Mediu</p>
              <h2 className="text-2xl font-bold text-red-600">{averageRating}</h2>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Building2 size={20} /> Lista recenziilor
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
                <option value="pending">În așteptare</option>
                <option value="approved">Aprobate</option>
                <option value="rejected">Respins</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow bg-white/90">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-gray-800">
                <tr>
                  <th className="p-3 border-b">Companie</th>
                  <th className="p-3 border-b">Client</th>
                  <th className="p-3 border-b text-center">Rating</th>
                  <th className="p-3 border-b">Recenzie</th>
                  <th className="p-3 border-b text-center">Status</th>
                  <th className="p-3 border-b text-center">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-emerald-50 transition"
                  >
                    <td className="p-3 border-b font-medium">
                      {r.companyName || "-"}
                    </td>
                    <td className="p-3 border-b">{r.clientName || "-"}</td>
                    <td className="p-3 border-b text-center text-amber-500">
                      {"★".repeat(r.rating || 0)}
                    </td>
                    <td className="p-3 border-b max-w-[300px] truncate">
                      {r.text}
                    </td>
                    <td className="p-3 border-b text-center capitalize">
                      {r.status || "pending"}
                    </td>
                    <td className="p-3 border-b text-center space-x-2">
                      {processingId === r.id ? (
                        <Loader2 className="animate-spin inline text-emerald-600" size={16} />
                      ) : (
                        <>
                          {r.status !== "approved" && (
                            <button
                              onClick={() => updateStatus(r.id, "approved")}
                              className="text-green-600 hover:underline text-sm font-medium"
                            >
                              <CheckCircle size={14} className="inline" /> Apr.
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              onClick={() => updateStatus(r.id, "rejected")}
                              className="text-red-600 hover:underline text-sm font-medium"
                            >
                              <XCircle size={14} className="inline" /> Resp.
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedReview(r)}
                            className="text-sky-600 hover:underline text-sm font-medium"
                          >
                            <MessageCircle size={14} className="inline" /> Răspunde
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-gray-500 hover:text-red-600 text-sm font-medium"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reply Modal */}
          {selectedReview && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg relative">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-emerald-700 mb-4">
                  Răspuns pentru {selectedReview.clientName}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Recenzie:</strong> {selectedReview.text}
                </p>
                <textarea
                  rows={4}
                  placeholder="Scrie răspunsul tău..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={() => handleReply(selectedReview.id)}
                  className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white py-2 rounded-xl font-medium shadow-md hover:scale-[1.03] transition"
                >
                  Trimite răspuns
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
