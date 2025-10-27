import "dotenv/config";
import { db } from "@/config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

async function testFirestore() {
  const snapshot = await getDocs(collection(db, "test"));
  console.log("✅ Firestore connected, documents:", snapshot.size);
}

testFirestore().catch(console.error);
