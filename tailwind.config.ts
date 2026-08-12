import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand — deep cricket green + gold
        brand: {
          50:  "#f0faf4",
          100: "#d9f2e4",
          200: "#b3e5c9",
          300: "#7dd0a8",
          400: "#48b585",
          500: "#249668",
          600: "#187a54",
          700: "#156145",
          800: "#134d38",
          900: "#10402f",
          950: "#07231b",
        },
        gold: {
          50:  "#fffdf0",
          100: "#fef9cc",
          200: "#fdf08a",
          300: "#fce24d",
          400: "#f9cc1b",
          500: "#e8af05",
          600: "#c78702",
          700: "#9e6005",
          800: "#834c0d",
          900: "#703f11",
          950: "#422005",
        },
        // Neutral
        slate: {
          850: "#1a2433",
          950: "#0d1420",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #07231b 0%, #156145 50%, #249668 100%)",
        "gold-gradient": "linear-gradient(135deg, #c78702 0%, #e8af05 50%, #f9cc1b 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        "glow-green": "0 0 30px rgba(36, 150, 104, 0.3)",
        "glow-gold": "0 0 30px rgba(232, 175, 5, 0.3)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
