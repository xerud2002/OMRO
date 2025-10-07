/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#10b981", // primary
          sky: "#0ea5e9",     // accent
          dark: "#064e3b",    // text dark
          light: "#ecfdf5",   // background light
        },
      },
      boxShadow: {
        soft: "0 4px 12px rgba(16, 185, 129, 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
