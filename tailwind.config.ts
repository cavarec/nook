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
        // NOOK brand palette
        sage: {
          50: "#f3f6f0",
          100: "#e3ebdc",
          200: "#c8d8ba",
          300: "#a8c092",
          400: "#8aab72",
          500: "#6f9456",
          600: "#577643",
          700: "#455e36",
          800: "#394c2d",
          900: "#304026",
        },
        cream: {
          50: "#fdfcf9",
          100: "#faf7f0",
          200: "#f3ede0",
          300: "#e9dfc9",
          400: "#dccaa8",
        },
        anthracite: {
          50: "#f2f3f3",
          100: "#dcdedd",
          200: "#b5bab8",
          300: "#8b928f",
          400: "#5f6866",
          500: "#3d4544",
          600: "#2b3130",
          700: "#232827",
          800: "#1a1e1d",
          900: "#121514",
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
