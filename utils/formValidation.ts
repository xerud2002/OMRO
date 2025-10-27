// utils/formValidation.ts
import { auth } from "../extra/firebase";

/**
 * ✅ Validează toate câmpurile obligatorii din formularul de cerere mutare.
 * Returnează:
 *  - string → mesaj de eroare clar pentru utilizator
 *  - null → totul este valid
 */
export function validateForm(formData: Record<string, any>): string | null {
  // 🔹 În Next.js (cu "use client"), auth.currentUser poate fi null la prima randare
  const currentUser = typeof window !== "undefined" ? auth.currentUser : null;
  const hasAutoEmail = !!currentUser?.email;

  /* -------------------------------------------------------
   * 🔸 1. Câmpuri obligatorii de bază
   * ------------------------------------------------------- */
  const requiredFields = [
    "serviceType",
    "pickupCounty",
    "pickupCity",
    "deliveryCounty",
    "deliveryCity",
    "name",
    "phone",
  ];

  // Email devine obligatoriu doar dacă userul nu e autentificat
  if (!hasAutoEmail) requiredFields.push("email");

  for (const field of requiredFields) {
    const value = formData[field];
    if (!value || String(value).trim() === "") {
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

  /* -------------------------------------------------------
   * 🔸 2. Email valid (doar dacă e necesar)
   * ------------------------------------------------------- */
  if (formData.email && !hasAutoEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Te rugăm să introduci o adresă de email validă.";
    }
  }

  /* -------------------------------------------------------
   * 🔸 3. Telefon valid
   * ------------------------------------------------------- */
  const phoneRegex = /^[0-9+ ]{7,20}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    return "Numărul de telefon introdus nu este valid.";
  }

  /* -------------------------------------------------------
   * 🔸 4. Dată mutare / flexibilitate
   * ------------------------------------------------------- */
  if (!formData.moveDate && !formData.moveOption) {
    return "Selectează data mutării sau bifează că ești flexibil.";
  }

  /* -------------------------------------------------------
   * 🔸 5. Tip survey selectat
   * ------------------------------------------------------- */
  if (!formData.survey) {
    return "Selectează o opțiune pentru evaluare (vizită, video sau media).";
  }

  /* -------------------------------------------------------
   * 🔸 6. Upload media dacă survey = "media"
   * ------------------------------------------------------- */
  if (
    formData.survey === "media" &&
    (!formData.media || formData.media.length === 0)
  ) {
    return "Adaugă cel puțin o poză sau un video pentru estimare.";
  }

  return null; // ✅ Totul este valid
}
