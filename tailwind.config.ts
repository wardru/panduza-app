import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily : {
        Lato: ["Lato", "sans-serif"]
      },
      colors: {
        header: "rgb(var(--color-header))",
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
      }
    },
  },
  plugins: [],
};
export default config;
