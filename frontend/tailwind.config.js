/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          "green-dark": "#158a3e",
          black: "#0a0a0a",
          dark: "#141414",
          card: "#1a1a1a",
          hover: "#242424",
          border: "#2a2a2a",
          "text-secondary": "#a0a0a0",
          "text-muted": "#6a6a6a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "card-green": "linear-gradient(135deg, #1a3a2a 0%, #0d1f15 100%)",
        "card-blue": "linear-gradient(135deg, #1a2a3a 0%, #0d151f 100%)",
        "card-purple": "linear-gradient(135deg, #2a1a3a 0%, #1a0d2a 100%)",
      },
    },
  },
  plugins: [],
};
