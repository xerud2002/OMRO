// utils/formValidation.ts
export function validateForm(formData: Record<string, any>): string | null {
  // ✅ Basic required fields
  const requiredFields = [
    "serviceType",
    "pickupCounty",
    "pickupCity",
    "deliveryCounty",
    "deliveryCity",
    "name",
    "phone",
    "email",
  ];

  for (const field of requiredFields) {
    if (!formData[field] || formData[field].trim() === "") {
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

  // ✅ Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    return "Te rugăm să introduci un email valid.";
  }

  // ✅ Phone number format
  const phoneRegex = /^[0-9+ ]{7,20}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    return "Numărul de telefon introdus nu este valid.";
  }

  // ✅ Move date check
  if (!formData.moveDate && !formData.moveOption) {
    return "Selectează data mutării sau marchează că ești flexibil.";
  }

  // ✅ Survey selection check
  if (!formData.survey) {
    return "Selectează o opțiune pentru survey (vizită, video sau estimare).";
  }

  // ✅ For file uploads
  if (formData.survey === "media" && (!formData.media || formData.media.length === 0)) {
    return "Adaugă cel puțin o poză sau un video pentru estimare.";
  }

  return null; // ✅ No errors
}
