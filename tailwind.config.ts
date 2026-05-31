import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WedPass brand colors
        navy: {
          DEFAULT: "#172033",
          hover: "#101827",
          soft: "#EEF2F8",
        },
        champagne: {
          DEFAULT: "#C8A45D",
          light: "#E8D5B0",
        },
        ivory: {
          DEFAULT: "#FAF7F1",
          dark: "#F0ECE2",
        },
        blush: {
          DEFAULT: "#F6D8D5",
        },
        beige: {
          DEFAULT: "#E8DCC8",
        },
        terracotta: {
          DEFAULT: "#B76E50",
        },
        // Operational status colors
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        sync: {
          DEFAULT: "#2563EB",
          light: "#DBEAFE",
        },
        offline: {
          DEFAULT: "#374151",
          light: "#F3F4F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: [
          "var(--font-playfair)",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
      },
      boxShadow: {
        card: "0 4px 16px rgba(15, 23, 42, 0.06)",
        elevated: "0 12px 32px rgba(15, 23, 42, 0.10)",
        modal: "0 24px 64px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
}

export default config
