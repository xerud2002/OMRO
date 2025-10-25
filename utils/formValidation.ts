// utils/formValidation.ts
import { auth } from "./firebase";

/**
 * Verifică dacă toate câmpurile obligatorii din formular sunt completate corect.
 * Returnează un mesaj de eroare (string) dacă există probleme, sau null dacă totul e valid.
 */
export function validateForm(formData: Record<string, any>): string | null {
  const currentUser = auth.currentUser;
  const hasAutoEmail = !!currentUser?.email;

  // ✅ Câmpuri obligatorii de bază
  const requiredFields = [
    "serviceType",
    "pickupCounty",
    "pickupCity",
    "deliveryCounty",
    "deliveryCity",
    "name",
    "phone",
  ];

  // Email devine obligatoriu doar dacă nu e autentificat
  if (!hasAutoEmail) requiredFields.push("email");

  for (const field of requiredFields) {
    if (!formData[field] || String(formData[field]).trim() === "") {
      switch (field) {
        case "serviceType":
          return "Selectează tipul de serviciu.";
        case "pickupCounty":
        case "pickupCity":
          return "Completează județul și localitatea de colectare.";
        case "deliveryCounty":
        case "deliveryCity":
          return "Completează județul și localitatea de livrare.";
        case "name":
          return "Numele complet este obligatoriu.";
        case "phone":
          return "Numărul de telefon este obligatoriu.";
        case "email":
          return "Adresa de email este obligatorie.";
      }
    }
  }

  // ✅ Verificare format email doar dacă există în formData
  if (formData.email && !hasAutoEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Te rugăm să introduci un email valid.";
    }
  }

  // ✅ Verificare număr de telefon
  const phoneRegex = /^[0-9+ ]{7,20}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    return "Numărul de telefon introdus nu este valid.";
  }

  // ✅ Verificare dată mutare sau opțiune flexibilă
  if (!formData.moveDate && !formData.moveOption) {
    return "Selectează data mutării sau marchează că ești flexibil.";
  }

  // ✅ Survey selectat
  if (!formData.survey) {
    return "Selectează o opțiune pentru survey (vizită, video sau estimare).";
  }

  // ✅ Upload media obligatoriu dacă survey = media
  if (
    formData.survey === "media" &&
    (!formData.media || formData.media.length === 0)
  ) {
    return "Adaugă cel puțin o poză sau un video pentru estimare.";
  }

  return null; // ✅ Totul e valid
}
