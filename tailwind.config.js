/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "IBM Plex Mono", "Space Mono", "monospace"],
      },
      colors: {
        canvas: "var(--color-canvas)",
        ink: "var(--color-ink)",
        structure: "var(--color-structure)",
        highlight: "var(--color-highlight)",
        invert: "var(--color-invert)",
      },
      letterSpacing: {
        terminal: "0.05em",
      },
    },
  },
  plugins: [],
}
