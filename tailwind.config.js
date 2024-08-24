// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/landing/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007566',
        'azul-rey': '#007566',
      },
    },
  },
  plugins: [],
};

export default config;
