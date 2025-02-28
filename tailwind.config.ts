import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    default: "cupcake",
    extend: {
      fontFamily: {
        opun: ['OpunMai', 'sans-serif'],
        opunbold: ['OpunMaiBold', 'sans-serif'],
        opunsemibold: ['OpunMaiSemiBold', 'sans-serif'],
        bernuro: ['Bernuro', 'sans-serif'],
        },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["cupcake","dark"],
  }
} satisfies Config;
