/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hilaal-blue': '#1e3a8a',    // Buluugga weyn ee sawirka
        'hilaal-gold': '#c27803',    // Dahabiga qoraalka "1447"
        'hilaal-light': '#3b82f6',   // Buluugga khafiifka ah
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}