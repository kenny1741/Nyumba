import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans:    ["DM Sans", "sans-serif"],
      },
      colors: {
        terracotta: "#C1440E",
        gold:       "#D4A847",
        forest:     "#1B4332",
        cream:      "#FDF6EC",
      },
    },
  },
  plugins: [],
};

export default config;
