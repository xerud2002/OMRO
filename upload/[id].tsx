"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, storage } from "../utils/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function UploadLater() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "requests", id as string)).then((snap) => {
      if (snap.exists()) setOrder(snap.data());
      else toast.error("Cererea nu a fost găsită.");
    });
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error("Selectează fișierele mai întâi.");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const storageRef = ref(storage, `uploads/${id}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
      await updateDoc(doc(db, "requests", id as string), {
        media: arrayUnion(...urls),
      });
      toast.success("Fișierele au fost încărcate cu succes!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      toast.error("Eroare la încărcare.");
    }
    setUploading(false);
  };

  if (!order)
    return <div className="text-center mt-20 text-gray-500">Se încarcă...</div>;

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
          <ul className="text-sm text-left mb-4 space-y-1 text-gray-700">
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
