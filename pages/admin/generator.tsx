"use client";
import { useState } from "react";
import { faker } from "@faker-js/faker";
import { db, onAuthChange } from "../../utils/firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";
import AdminProtectedRoute from "../../components/AdminProtectedRoute";
import toast from "react-hot-toast";
import {
  Loader2,
  Factory,
  UserPlus,
  Building2,
  ClipboardList,
} from "lucide-react";

export default function AdminGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 🔹 Helper: generate random Romanian-style phone
  const fakePhone = () =>
    `+40${faker.number.int({ min: 600000000, max: 799999999 })}`;

  const handleGenerate = async (
    type: "users" | "companies" | "requests",
    count: number
  ) => {
    setLoading(true);
    try {
      const currentUser = await new Promise((resolve, reject) =>
        onAuthChange((u) => (u ? resolve(u) : reject("no user")))
      );

      const snap = await getDoc(doc(db, "users", (currentUser as any).uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        toast.error("⛔ Doar adminii pot genera date!");
        router.push("/");
        return;
      }

      const promises = [];
      for (let i = 0; i < count; i++) {
        // 👤 USERS
        if (type === "users") {
          promises.push(
            addDoc(collection(db, "users"), {
              name: faker.person.fullName(),
              email: faker.internet.email(),
              phone: fakePhone(),
              role: "customer",
              createdAt: new Date(),
            })
          );
        }

        // 🏢 COMPANIES
        if (type === "companies") {
          promises.push(
            addDoc(collection(db, "companies"), {
              name: faker.company.name(),
              email: faker.internet.email(),
              phone: fakePhone(),
              verified: faker.datatype.boolean(),
              submittedForVerification: faker.datatype.boolean(),
              counties: [faker.location.county()],
              createdAt: new Date(),
            })
          );
        }

        // 📦 REQUESTS
        if (type === "requests") {
          const pickupCity = faker.location.city();
          const deliveryCity = faker.location.city();

          promises.push(
            addDoc(collection(db, "requests"), {
              serviceType: faker.helpers.arrayElement([
                "Mutare locuință",
                "Mutare birou",
                "Transport obiecte",
              ]),
              propertyType: faker.helpers.arrayElement(["Apartament", "Casă"]),
              rooms: faker.number.int({ min: 1, max: 5 }),
              houseFloors: faker.number.int({ min: 1, max: 3 }),
              floor: faker.helpers.arrayElement(["Parter", "1", "2", "3"]),
              lift: faker.helpers.arrayElement(["Da", "Nu"]),
              packing: faker.helpers.arrayElement(["Da", "Nu"]),
              dismantling: faker.helpers.arrayElement(["Da", "Nu"]),
              survey: faker.helpers.arrayElement([
                "video",
                "vizită",
                "media",
                "media_later",
              ]),
              details: faker.lorem.sentence(),
              name: faker.person.fullName(),
              phone: fakePhone(),
              email: faker.internet.email(),
              moveDate: faker.date.soon({ days: 30 }).toISOString(),
              moveOption: faker.helpers.arrayElement(["Direct", "Cu depozitare"]),
              pickupCounty: faker.location.county(),
              pickupCity,
              pickupStreet: faker.location.street(),
              pickupNumber: faker.number.int({ min: 1, max: 150 }),
              pickupDetails: faker.location.secondaryAddress(),
              pickupPostal: faker.location.zipCode(),
              pickupInstructions: faker.lorem.sentence(),
              deliveryCounty: faker.location.county(),
              deliveryCity,
              deliveryStreet: faker.location.street(),
              deliveryNumber: faker.number.int({ min: 1, max: 150 }),
              deliveryDetails: faker.location.secondaryAddress(),
              deliveryPostal: faker.location.zipCode(),
              deliveryInstructions: faker.lorem.sentence(),
              propertyTypeTo: faker.helpers.arrayElement([
                "Casă",
                "Apartament",
                "Depozit",
              ]),
              roomsTo: faker.number.int({ min: 1, max: 5 }),
              houseFloorsTo: faker.number.int({ min: 1, max: 3 }),
              floorTo: faker.helpers.arrayElement(["Parter", "1", "2", "3"]),
              liftTo: faker.helpers.arrayElement(["Da", "Nu"]),
              userId: faker.string.uuid(),
              status: faker.helpers.arrayElement([
                "noua",
                "in_interes",
                "finalizata",
              ]),
              createdAt: new Date(),
            })
          );
        }
      }

      await Promise.all(promises);
      toast.success(`✅ ${count} ${type} generate cu succes!`);
    } catch (err) {
      console.error(err);
      toast.error("Eroare la generarea datelor!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-xl p-8 mt-6 mb-20"
        >
          <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2 mb-8">
            <Factory size={28} /> Generator date fictive
          </h1>

          <div className="grid sm:grid-cols-3 gap-6">
            <button
              onClick={() => handleGenerate("users", 10)}
              disabled={loading}
              className="p-6 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-2xl shadow-lg hover:scale-105 transition flex flex-col items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={28} />}
              <span className="mt-2 font-semibold">Generează 10 clienți</span>
            </button>

            <button
              onClick={() => handleGenerate("companies", 5)}
              disabled={loading}
              className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-lg hover:scale-105 transition flex flex-col items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Building2 size={28} />}
              <span className="mt-2 font-semibold">Generează 5 companii</span>
            </button>

            <button
              onClick={() => handleGenerate("requests", 10)}
              disabled={loading}
              className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-lg hover:scale-105 transition flex flex-col items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ClipboardList size={28} />}
              <span className="mt-2 font-semibold">Generează 10 cereri</span>
            </button>
          </div>
        </motion.div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
