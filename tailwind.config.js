/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // adăugăm explicit font-sans
      },
      colors: {
        emerald: { 500: "#10b981" },
        sky: { 500: "#0ea5e9" },
      },
    },
  },
  plugins: [],
};
