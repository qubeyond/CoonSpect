/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#F8F9FA',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
        },
        light: {
          100: '#1E1F3A',
          200: '#16182D',
          300: '#10112A',
          400: '#0B0C1C',
        }
      },
    },
  },
  plugins: [],
}
