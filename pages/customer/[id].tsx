"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage, onAuthChange } from "../../extra/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { SendHorizontal, ArrowLeft, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender: "client" | "company" | "admin";
  text?: string;
  type: "text" | "image" | "video" | "file";
  fileName?: string;
  fileUrl?: string;
  createdAt?: Timestamp;
}

export default function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "company" | "admin" | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [unread, setUnread] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔊 preload sound
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp3");
    audioRef.current.volume = 0.3;
  }, []);

  // 🔐 Auth + Role detection
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push("/customer/auth");
        return;
      }

      setUserId(u.uid);

      // Detect role from Firestore
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const role = snap.data()?.role || "client";
          setUserRole(role === "company" ? "company" : role === "admin" ? "admin" : "client");
        } else {
          setUserRole("client");
        }
      } catch {
        setUserRole("client");
      }
    });
    return () => unsub();
  }, [router]);

  // 🔄 Fetch order + messages
  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "requests", id));
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
        else toast.error("❌ Cererea nu a fost găsită.");
      } catch (err) {
        console.error(err);
        toast.error("Eroare la încărcarea cererii.");
      }
    };
    loadOrder();

    const q = query(collection(db, "requests", id, "messages"), orderBy("createdAt", "asc"));

    let prevCount = 0;
    const unsub = onSnapshot(q, (snap) => {
      const newMsgs: Message[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      setMessages(newMsgs);

      // Auto-scroll to bottom
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 150);

      // Play sound only for new incoming messages
      if (newMsgs.length > prevCount) {
        const last = newMsgs[newMsgs.length - 1];
        if (last && last.sender !== userRole && document.hasFocus()) {
          audioRef.current?.play().catch(() => {});
          setUnread(true);
        }
      }
      prevCount = newMsgs.length;
    });

    return () => unsub();
  }, [id, userRole]);

  // ✉️ send text message
  const sendMessage = async () => {
    if (!id || !newMessage.trim() || !userId || !userRole) return;
    try {
      await addDoc(collection(db, "requests", id, "messages"), {
        sender: userRole,
        text: newMessage.trim(),
        type: "text",
        createdAt: Timestamp.now(),
      });
      setNewMessage("");
      setUnread(false);
    } catch (err) {
      console.error(err);
      toast.error("Eroare la trimiterea mesajului.");
    }
  };

  // 📎 send file (image/video/pdf)
  const sendFile = async (file: File) => {
    if (!id || !userId || !userRole) return;
    setUploading(true);

    try {
      const cleanName = file.name.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
      const storageRef = ref(storage, `chat/${id}/${Date.now()}_${cleanName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snap) => {
          const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
          if (pct % 25 === 0) toast.loading(`Se încarcă... ${pct.toFixed(0)}%`, { id: "upload" });
        },
        (err) => {
          console.error(err);
          toast.error("Eroare la încărcarea fișierului.");
        },
        async () => {
          toast.dismiss("upload");
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          await addDoc(collection(db, "requests", id, "messages"), {
            sender: userRole,
            type: isImage ? "image" : isVideo ? "video" : "file",
            fileName: file.name,
            fileUrl: url,
            createdAt: Timestamp.now(),
          });
          setUnread(false);
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Eroare la trimiterea fișierului.");
    } finally {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* 🔹 Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="relative p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition"
          title="Înapoi"
        >
          <ArrowLeft size={20} />
          {unread && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <h1 className="text-2xl font-bold text-emerald-700">
          Detalii comandă #{order.id}
        </h1>
      </div>

      {/* 🔹 Order Info */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow mb-6">
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <p><strong>Serviciu:</strong> {order.serviceType || "-"}</p>
          <p><strong>Data:</strong> {order.moveDate || order.moveOption || "-"}</p>
          <p><strong>Colectare:</strong> {order.pickupCity || "-"}, {order.pickupCounty || "-"}</p>
          <p><strong>Livrare:</strong> {order.deliveryCity || "-"}, {order.deliveryCounty || "-"}</p>
          <p><strong>Status:</strong> <span className="text-emerald-600 font-medium">{order.status || "Nouă"}</span></p>
        </div>
      </div>

      {/* 🔹 Chat */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow-lg p-6 flex flex-col h-[60vh]">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
          💬 Mesaje
          {unread && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              Nou
            </span>
          )}
        </h2>

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
                    ? "ml-auto bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
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

        {/* 🔸 Input & Upload */}
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
            {uploading ? (
              <span className="text-xs px-2">Se încarcă...</span>
            ) : (
              <SendHorizontal size={20} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
