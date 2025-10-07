"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../utils/firebase";
import { setDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

// 🔹 Import all step components
import StepService from "../components/formSteps/StepService";
import StepProperty from "../components/formSteps/StepProperty";
import StepPickupAddress from "../components/formSteps/StepPickupAddress";
import StepDeliveryProperty from "../components/formSteps/StepDeliveryProperty";
import StepDeliveryAddress from "../components/formSteps/StepDeliveryAddress";
import StepMoveDate from "../components/formSteps/StepMoveDate";
import StepPacking from "../components/formSteps/StepPacking";
import StepDismantling from "../components/formSteps/StepDismantling";
import StepSurvey from "../components/formSteps/StepSurvey";
import StepContact from "../components/formSteps/StepContact";

// 🧭 Step titles
const steps = [
  "Tip serviciu",
  "Dimensiunea mutării",
  "Detalii colectare",
  "Tip proprietate destinație",
  "Adresa livrare",
  "Data mutării",
  "Împachetare",
  "Demontare",
  "Survey estimare",
  "Date de contact",
];

export default function MoveForm() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);

  // ✅ Default form state
  const defaultFormData = {
    serviceType: "",
    propertyType: "",
    rooms: "",
    houseFloors: "",
    floor: "",
    lift: "",
    packing: "",
    dismantling: "",
    survey: "",
    details: "",
    name: "",
    phone: "",
    email: "",
    moveDate: "",
    moveOption: "",
    pickupCounty: "",
    pickupCity: "",
    pickupStreet: "",
    pickupNumber: "",
    pickupDetails: "",
    pickupPostal: "",
    pickupInstructions: "",
    deliveryCounty: "",
    deliveryCity: "",
    deliveryStreet: "",
    deliveryNumber: "",
    deliveryDetails: "",
    deliveryPostal: "",
    deliveryInstructions: "",
    propertyTypeTo: "",
    roomsTo: "",
    houseFloorsTo: "",
    floorTo: "",
    liftTo: "",
    media: [] as File[],
  };

  const [formData, setFormData] = useState<any>(defaultFormData);

  // ✅ Restore progress from localStorage
  useEffect(() => {
    const savedStep = localStorage.getItem("moveFormStep");
    const savedData = localStorage.getItem("moveFormData");
    if (savedStep) setStep(Number(savedStep));
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch {
        console.warn("⚠️ Invalid saved data, resetting form");
      }
    }
    setHydrated(true);
  }, []);

  // ✅ Persist progress
  useEffect(() => {
    if (hydrated) localStorage.setItem("moveFormStep", step.toString());
  }, [step, hydrated]);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem("moveFormData", JSON.stringify(formData));
  }, [formData, hydrated]);

  if (!hydrated)
    return (
      <div className="text-center py-16 text-emerald-600 font-medium">
        Se încarcă formularul...
      </div>
    );

  // 🔹 Field change helper
  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 🔹 Navigation
  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  // ✅ Submission
  const handleSubmit = async () => {
    try {
      toast.loading("Se trimite cererea...");

      // Upload files if any
      let mediaUrls: string[] = [];
      if (formData.survey === "media" && formData.media.length > 0) {
        mediaUrls = await Promise.all(
          formData.media.map(async (file: File) => {
            const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            return getDownloadURL(storageRef);
          })
        );
      }

      // 🔹 Generează ID scurt unic și verifică să nu existe deja
      let shortId: string;
      let exists = true;
      do {
        shortId = `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const checkDoc = await getDoc(doc(db, "requests", shortId));
        exists = checkDoc.exists();
      } while (exists);

      // 🔹 Creează manual documentul cu ID-ul personalizat
      await setDoc(doc(db, "requests", shortId), {
        ...formData,
        media: mediaUrls,
        userId: auth.currentUser?.uid || null,
        createdAt: Timestamp.now(),
        status: "Nouă",
        requestId: shortId, // pentru referințe ulterioare
      });

      // 🔹 Salvează informațiile de contact ale utilizatorului (dacă e logat)
      if (auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          },
          { merge: true }
        );
      }

      // 🔹 Trimite e-mail cu link de upload dacă survey = "media_later"
      if (formData.survey === "media_later" && formData.email) {
        const uploadLink = `${window.location.origin}/upload/${shortId}`;
        await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          {
            to_email: formData.email,
            to_name: formData.name || "Client",
            upload_link: uploadLink,
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
      }

      toast.dismiss();
      toast.success("✅ Cererea ta a fost salvată cu succes!");

      // Reset form
      setFormData(defaultFormData);
      setStep(0);
      localStorage.removeItem("moveFormData");
      localStorage.removeItem("moveFormStep");

      router.push("/customer/dashboard");
    } catch (err) {
      console.error("❌ Eroare la salvare:", err);
      toast.dismiss();
      toast.error("A apărut o eroare la salvarea cererii.");
    }
  };

  // 🔹 Render correct step
  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepService formData={formData} handleChange={handleChange} />;
      case 1:
        return <StepProperty formData={formData} handleChange={handleChange} />;
      case 2:
        return (
          <StepPickupAddress formData={formData} handleChange={handleChange} />
        );
      case 3:
        return (
          <StepDeliveryProperty
            formData={formData}
            handleChange={handleChange}
          />
        );
      case 4:
        return (
          <StepDeliveryAddress formData={formData} handleChange={handleChange} />
        );
      case 5:
        return <StepMoveDate formData={formData} handleChange={handleChange} />;
      case 6:
        return <StepPacking formData={formData} handleChange={handleChange} />;
      case 7:
        return (
          <StepDismantling formData={formData} handleChange={handleChange} />
        );
      case 8:
        return (
          <StepSurvey
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
          />
        );
      case 9:
        return <StepContact formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  // === UI ===
  return (
    <div className="flex flex-col min-h-screen">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl border border-emerald-100 shadow-xl rounded-3xl p-10 w-full max-w-2xl hover:shadow-emerald-100"
        >
          {/* --- Progress --- */}
          <div className="mb-10 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Pasul {step + 1} din {steps.length}
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-2 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
              />
            </div>
          </div>

          {/* --- Step content --- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* --- Navigation buttons --- */}
          <div className="mt-10 flex justify-between items-center">
            {step > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                <ArrowLeft size={18} /> Înapoi
              </button>
            ) : (
              <div />
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-medium shadow-md hover:scale-105 transition-all"
              >
                Următorul <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-medium shadow-md hover:scale-105 transition-all"
              >
                Trimite cererea <Send size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
