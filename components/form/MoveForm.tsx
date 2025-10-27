"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../utils/firebase";
import { uploadMultipleFiles } from "../../utils/storageService";
import { setDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

// === Form steps ===
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

export default function MoveForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>(defaultFormData);
  const [progress, setProgress] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  /* ===============================
     🔹 Check user authentication
  ================================ */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast.error("Trebuie să te autentifici pentru a completa cererea.");
        router.push("/customer/auth");
      } else {
        setCurrentUser(user);
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = useCallback(
    (field: string, value: any) => setFormData((prev: any) => ({ ...prev, [field]: value })),
    []
  );

  const requiredSteps: Record<number, string[]> = {
    0: ["serviceType"],
    1: ["propertyType"],
    2: ["pickupCity", "pickupCounty"],
    4: ["deliveryCity", "deliveryCounty"],
    9: ["name", "phone"],
  };

  const validateStep = useCallback(() => {
    const fields = requiredSteps[step];
    if (!fields) return true;
    for (const f of fields) {
      if (!formData[f]?.trim()) {
        toast.error("Completează câmpurile obligatorii înainte de a continua.");
        return false;
      }
    }
    return true;
  }, [step, formData]);

  const nextStep = () => validateStep() && setStep((p) => Math.min(p + 1, steps.length - 1));
  const prevStep = () => setStep((p) => Math.max(p - 1, 0));

  /* ===============================
     🚀 Handle submit
  ================================ */
  const handleSubmit = async () => {
    if (submitting) return;
    if (!currentUser?.uid) {
      toast.error("Autentificarea a expirat. Te rugăm să te reconectezi.");
      router.push("/customer/auth");
      return;
    }

    setSubmitting(true);
    toast.loading("Se trimite cererea...");

    try {
      // ✅ Generate unique request ID
      let shortId: string;
      do {
        shortId = `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      } while ((await getDoc(doc(db, "requests", shortId))).exists());

      // ✅ Upload media files if any
      const mediaUrls =
        formData.survey === "media" && formData.media?.length
          ? await uploadMultipleFiles(formData.media, `uploads/${shortId}`, setProgress)
          : [];

      // ✅ Build Firestore document
      const requestPayload = {
        ...formData,
        media: mediaUrls,
        userId: currentUser.uid,
        email: currentUser.email,
        createdAt: Timestamp.now(),
        status: "Nouă",
        requestId: shortId,
      };

      console.log("📦 Payload Firestore:", requestPayload);

      // ✅ Save request
      await setDoc(doc(db, "requests", shortId), requestPayload);

      // ✅ Update user profile
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          name: formData.name,
          phone: formData.phone,
          email: currentUser.email,
          role: "customer",
          userId: currentUser.uid,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      // ✅ Optional email (survey media later)
      if (formData.survey === "media_later" && currentUser.email) {
        try {
          const uploadLink = `${window.location.origin}/upload/${shortId}`;
          await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
            {
              to_email: currentUser.email,
              to_name: formData.name || "Client",
              upload_link: uploadLink,
            },
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
          );
        } catch (e) {
          console.warn("⚠️ EmailJS send failed:", e);
        }
      }

      toast.dismiss();
      toast.success("✅ Cererea a fost trimisă cu succes!");
      setTimeout(() => router.push(`/form/success?id=${shortId}`), 1000);

      // ✅ Reset form
      setFormData(defaultFormData);
      setStep(0);
    } catch (err: any) {
      console.error("❌ Firestore error:", err);
      toast.dismiss();
      toast.error("Eroare la trimiterea cererii: " + (err.message || err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const stepComponents = [
    StepService,
    StepProperty,
    StepPickupAddress,
    StepDeliveryProperty,
    StepDeliveryAddress,
    StepMoveDate,
    StepPacking,
    StepDismantling,
    StepSurvey,
    StepContact,
  ];
  const CurrentStep = stepComponents[step];

  if (!ready)
    return (
      <div className="text-center py-20 text-emerald-600 font-semibold">
        Se încarcă formularul...
      </div>
    );

  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-emerald-50 to-sky-50 px-4 py-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-md border border-emerald-100 shadow-xl rounded-3xl p-10 w-full max-w-2xl"
      >
        {/* === Progress === */}
        <div className="mb-10 text-center">
          <p className="text-sm text-gray-600 mb-1">
            {steps[step]} • Pasul {step + 1} din {steps.length}
          </p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4 }}
              className="h-2 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
            />
          </div>
        </div>

        {/* === Step === */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <CurrentStep formData={formData} handleChange={handleChange} setFormData={setFormData} />
          </motion.div>
        </AnimatePresence>

        {/* === Upload Progress === */}
        {progress > 0 && progress < 100 && (
          <div className="mt-6 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* === Navigation === */}
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
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium shadow-md transition-all ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-emerald-500 to-sky-500 text-white hover:scale-105"
              }`}
            >
              {submitting ? "Se trimite..." : <>Trimite cererea <Send size={18} /></>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
