"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { db, onAuthChange } from "../../utils/firebase";
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
import { motion } from "framer-motion";
import { SendHorizontal, ArrowLeft } from "lucide-react";

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userRole, setUserRole] = useState<"client" | "company">("client");
  const chatRef = useRef<HTMLDivElement>(null);

  // 🔹 Auth check
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) router.push("/customer/auth");
      else {
        // Optional: determine role (future)
        setUserRole("client");
      }
    });
    return () => unsub();
  }, [router]);

  // 🔹 Fetch order + live messages
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "requests", id as string));
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    };
    fetchOrder();

    const q = query(
      collection(db, "requests", id as string, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      // scroll to bottom
      setTimeout(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    });
    return () => unsub();
  }, [id]);

  const sendMessage = async () => {
    if (!id || !newMessage.trim()) return;
    await addDoc(collection(db, "requests", id as string, "messages"), {
      sender: userRole,
      text: newMessage.trim(),
      createdAt: Timestamp.now(),
    });
    setNewMessage("");
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
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-emerald-700">
          Detalii Comandă #{order.id}
        </h1>
      </div>

      {/* Order Info */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow mb-6">
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <p>
            <strong>Serviciu:</strong> {order.serviceType}
          </p>
          <p>
            <strong>Data:</strong> {order.moveDate || order.moveOption}
          </p>
          <p>
            <strong>Colectare:</strong> {order.pickupCity}, {order.pickupCounty}
          </p>
          <p>
            <strong>Livrare:</strong> {order.deliveryCity}, {order.deliveryCounty}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className="text-emerald-600 font-medium">
              {order.status || "Nouă"}
            </span>
          </p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-emerald-100 shadow-lg p-6 flex flex-col h-[60vh]">
        <h2 className="text-lg font-semibold text-emerald-700 mb-3">💬 Mesaje</h2>

        {/* Messages list */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin scrollbar-thumb-emerald-200 pr-2"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                msg.sender === userRole
                  ? "ml-auto bg-gradient-to-r from-emerald-500 to-sky-500 text-white"
                  : "mr-auto bg-gray-100 text-gray-800"
              }`}
            >
              <p>{msg.text}</p>
              <span className="block text-xs opacity-70 mt-1">
                {msg.createdAt?.toDate
                  ? msg.createdAt.toDate().toLocaleString()
                  : ""}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Message input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Scrie un mesaj..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border border-emerald-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
          />
          <button
            onClick={sendMessage}
            className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:scale-105 transition"
            title="Trimite"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
