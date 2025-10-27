"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, storage } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function UploadLater() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // 🔹 Load request data
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "requests", id as string));
      if (snap.exists()) setOrder(snap.data());
      else toast.error("Cererea nu a fost găsită.");
    };
    fetchOrder();
  }, [id]);

  // 🔹 File select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  // 🔹 Upload files
  const handleUpload = async () => {
    if (!files.length) return toast.error("Selectează fișierele mai întâi.");
    setUploading(true);

    try {
      const urls: string[] = [];

      for (const file of files) {
        // Check size (limit 20MB)
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} este prea mare (max 20MB).`);
          continue;
        }

        const cleanName = file.name
          .replace(/\s+/g, "_")
          .replace(/[^\w.-]/g, "");
        const storageRef = ref(
          storage,
          `uploads/${id}/${Date.now()}_${cleanName}`
        );

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }

      if (urls.length > 0) {
        await updateDoc(doc(db, "requests", id as string), {
          media: arrayUnion(...urls),
        });
        toast.success("✅ Fișierele au fost încărcate cu succes!");
        setUploaded(true);
      } else {
        toast.error("Niciun fișier valid nu a fost încărcat.");
      }

      setFiles([]);
    } catch (err) {
      console.error("❌ Eroare la încărcare:", err);
      toast.error("A apărut o eroare la upload.");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Show "thank you" after upload
  if (uploaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 p-6"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-emerald-100 p-8 text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h2 className="text-2xl font-bold text-emerald-700 mb-2">
            Mulțumim!
          </h2>
          <p className="text-gray-600 text-sm">
            Fișierele au fost încărcate cu succes. Echipa de mutare le va
            verifica în scurt timp.
          </p>
        </div>
      </motion.div>
    );
  }

  // 🔹 Loading state
  if (!order)
    return (
      <div className="text-center mt-20 text-gray-500 text-lg">
        Se încarcă detaliile cererii...
      </div>
    );

  // 🔹 Main upload form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 p-6"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-emerald-100 p-8 w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold text-emerald-700 mb-3">
          Încarcă fișiere pentru cererea #{id}
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Serviciu: {order.serviceType || "-"}
        </p>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="w-full text-sm border border-gray-300 rounded-lg p-3 mb-4 cursor-pointer"
        />

        {files.length > 0 && (
          <ul className="text-sm text-left mb-4 space-y-1 text-gray-700 max-h-40 overflow-y-auto">
            {files.map((f, i) => (
              <li key={i}>📎 {f.name}</li>
            ))}
          </ul>
        )}

        <button
          disabled={uploading}
          onClick={handleUpload}
          className={`w-full py-3 rounded-full text-white font-medium transition-all ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-sky-500 hover:scale-105"
          }`}
        >
          {uploading ? "Se încarcă..." : "Trimite fișierele"}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Poți închide pagina după ce uploadul este complet.
        </p>
      </div>
    </motion.div>
  );
}
