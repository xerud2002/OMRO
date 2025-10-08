"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage, onAuthChange } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { SendHorizontal, ArrowLeft, Paperclip, Unlock, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender: "client" | "company";
  text?: string;
  type: "text" | "image" | "video" | "file";
  fileName?: string;
  fileUrl?: string;
  createdAt?: Timestamp;
}

export default function CompanyOrderDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [freeLeads, setFreeLeads] = useState<number>(0);
  const [userRole, setUserRole] = useState<"client" | "company">("company");
  const [unread, setUnread] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔹 Load subtle notification sound
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp3");
    audioRef.current.volume = 0.3;
  }, []);

  // 🔹 Auth check
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) router.push("/company/auth");
      else {
        setUser(u);
        setUserRole("company");
      }
    });
    return () => unsub();
  }, [router]);

  // 🔹 Load order + messages realtime
  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      const snap = await getDoc(doc(db, "requests", id));
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    };
    loadOrder();

    const q = query(collection(db, "requests", id, "messages"), orderBy("createdAt", "asc"));
    let previousMessages = 0;

    const unsub = onSnapshot(q, (snap) => {
      const newMsgs: Message[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      setMessages(newMsgs);

      // Auto scroll
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      }, 150);

      // Sound alert
      if (newMsgs.length > previousMessages) {
        const last = newMsgs[newMsgs.length - 1];
        if (last && last.sender !== userRole) {
          setUnread(true);
          audioRef.current?.play().catch(() => {});
        }
      }
      previousMessages = newMsgs.length;
    });

    return () => unsub();
  }, [id, userRole]);

  // 🔹 Check company free leads
  useEffect(() => {
    const loadFreeLeads = async () => {
      if (!user) return;
      const companyRef = doc(db, "companies", user.uid);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        const data = companySnap.data();
        setFreeLeads(data.freeLeads || 0);
      }
    };
    loadFreeLeads();
  }, [user]);

  // 🔹 Unlock contact info (use a free lead if available)
  const handleUnlock = async () => {
    if (!user) return;
    const companyRef = doc(db, "companies", user.uid);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) {
      toast.error("Contul companiei nu a fost găsit.");
      return;
    }

    const companyData = companySnap.data();
    const currentFree = companyData?.freeLeads || 0;

    if (currentFree > 0) {
      await updateDoc(companyRef, { freeLeads: currentFree - 1 });
      setFreeLeads(currentFree - 1);
      setHasUnlocked(true);
      toast.success("🎁 Ai folosit un lead gratuit pentru a debloca detaliile clientului!");
    } else {
      toast.error("ℹ️ Ai epuizat lead-urile gratuite. Este necesară o plată pentru a debloca contactele.");
    }
  };

  // 🔹 Send text message
  const sendMessage = async () => {
    if (!id || !newMessage.trim()) return;
    await addDoc(collection(db, "requests", id, "messages"), {
      sender: userRole,
      text: newMessage.trim(),
      type: "text",
      createdAt: Timestamp.now(),
    });
    setNewMessage("");
    setUnread(false);
  };

  // 🔹 Send file
  const sendFile = async (file: File) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `chat/${id}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      await addDoc(collection(db, "requests", id, "messages"), {
        sender: userRole,
        type: isImage ? "image" : isVideo ? "video" : "file",
        fileName: file.name,
        fileUrl: url,
        createdAt: Timestamp.now(),
      });
      setUploading(false);
      setUnread(false);
    } catch (err) {
      console.error("Eroare la upload:", err);
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await sendFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!order)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500 text-lg">
        Se încarcă detaliile comenzii...
      </div>
    );

  const canViewContacts = hasUnlocked || freeLeads > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* --- Header --- */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="relative p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition"
          title="Înapoi"
        >
          <ArrowLeft size={20} />
          {unread && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
        <h1 className="text-2xl font-bold text-emerald-700">
          Conversație comandă #{order.id}
        </h1>
      </div>

      {/* --- Order Info --- */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow mb-6">
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <p><strong>Serviciu:</strong> {order.serviceType || "-"}</p>
          <p><strong>Data:</strong> {order.moveDate || order.moveOption || "-"}</p>
          <p><strong>Client:</strong> {canViewContacts ? order.name : "Deblochează pentru a vedea"}</p>
          <p><strong>Email:</strong> {canViewContacts ? order.email : "🔒 Confidențial"}</p>
          <p><strong>Telefon:</strong> {canViewContacts ? order.phone : "🔒 Confidențial"}</p>
          <p><strong>Colectare:</strong> {order.pickupCity || "-"}, {order.pickupCounty || "-"}</p>
          <p><strong>Livrare:</strong> {order.deliveryCity || "-"}, {order.deliveryCounty || "-"}</p>
          <p><strong>Status:</strong>{" "}
            <span className="text-emerald-600 font-medium">{order.status || "Nouă"}</span>
          </p>
        </div>

        {!canViewContacts && (
          <button
            onClick={handleUnlock}
            className="mt-5 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl px-4 py-2 font-medium shadow-md hover:scale-[1.03] transition"
          >
            <Unlock size={18} /> Deblochează contactele
          </button>
        )}

        {canViewContacts && (
          <div className="mt-4 text-sm text-emerald-600 flex items-center gap-2">
            <Unlock size={16} /> Detaliile clientului sunt vizibile
          </div>
        )}
      </div>

      {/* --- Chat --- */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow-lg p-6 flex flex-col h-[60vh]">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
          💬 Mesaje
          {unread && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              Nou
            </span>
          )}
        </h2>

        {/* --- Messages --- */}
        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-emerald-200">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-4">Nu există mesaje încă.</p>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm break-words ${
                  msg.sender === userRole
                    ? "ml-auto bg-gradient-to-r from-sky-500 to-emerald-500 text-white"
                    : "mr-auto bg-gray-100 text-gray-800"
                }`}
              >
                {msg.type === "image" && msg.fileUrl ? (
                  <img src={msg.fileUrl} alt={msg.fileName} className="rounded-lg max-w-[200px] mb-2" />
                ) : msg.type === "video" && msg.fileUrl ? (
                  <video src={msg.fileUrl} controls className="rounded-lg max-w-[200px] mb-2" />
                ) : msg.type === "file" && msg.fileUrl ? (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-sm">
                    📎 {msg.fileName}
                  </a>
                ) : (
                  <p>{msg.text}</p>
                )}
                <span className="block text-xs opacity-70 mt-1">
                  {msg.createdAt?.toDate
                    ? msg.createdAt.toDate().toLocaleString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </motion.div>
            ))
          )}
        </div>

        {/* --- Input --- */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Scrie un mesaj..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border border-emerald-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            hidden
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition disabled:opacity-50"
            title="Atașează fișier"
          >
            <Paperclip size={20} />
          </button>
          <button
            onClick={sendMessage}
            disabled={uploading}
            className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:scale-105 transition disabled:opacity-50"
            title="Trimite mesaj"
          >
            {uploading ? <span className="text-xs px-2">Se încarcă...</span> : <SendHorizontal size={20} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
