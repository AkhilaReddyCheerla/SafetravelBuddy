/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        primaryDark: "#4c1d95",
        accent: "#f97316",
        background: "#020617",
        card: "#0f172a",
      },
    },
  },
  plugins: [],
};
