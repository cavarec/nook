import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // NOOK brand palette (pack branding fourni)
        nook: {
          // Bleu Nook #0B4D88
          50: "#eaf2f8",
          100: "#d0e3f1",
          200: "#a3c7e3",
          300: "#75abd4",
          400: "#4886b8",
          500: "#1f6699",
          600: "#0b4d88",
          700: "#0a3f70",
          800: "#08325a",
          900: "#062744",
        },
        leaf: {
          // Vert Frais #34C759 / Vert Feuille #2E7D32
          50: "#eef8ef",
          100: "#d7f0d9",
          200: "#b0e0b4",
          300: "#7fc986",
          400: "#34c759",
          500: "#2e7d32",
          600: "#256a29",
          700: "#1d5620",
          800: "#164418",
          900: "#0f3312",
        },
        sun: {
          // Orange Achat #FF9800
          50: "#fff4e0",
          100: "#ffe4b3",
          300: "#ffb84d",
          500: "#ff9800",
          700: "#cc7a00",
          900: "#995c00",
        },
        plum: {
          // Violet Maison #7E57C2
          50: "#f3effa",
          100: "#e3d9f4",
          300: "#b79ce0",
          500: "#7e57c2",
          700: "#5f3f96",
          900: "#402a64",
        },
        mist: {
          // Gris Doux #ECEFF1
          50: "#fbfcfd",
          100: "#eceff1",
          200: "#dfe4e8",
          300: "#c3ccd2",
          400: "#97a3ac",
          500: "#6b7880",
          600: "#4f5b63",
          700: "#3a444b",
          800: "#262e33",
          900: "#171c1f",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
