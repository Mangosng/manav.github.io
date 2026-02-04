/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Special Elite", "monospace"],
        body: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        dark: "#111111",
        grayish: "#1b1b1b",
        mid: "#2a2a2a",
        light: "#d1d1d1",
        accent: "#e5e5e5",
      },
    },
  },
  plugins: [],
}
