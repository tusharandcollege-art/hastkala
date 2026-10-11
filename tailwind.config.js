/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef3e2',
          100: '#fde0b0',
          200: '#fbcc7b',
          300: '#f9b845',
          400: '#f8a921',
          500: '#f79a08',
          600: '#e08a04',
          700: '#c47604',
          800: '#a96204',
          900: '#8b4e03',
        },
        earth: {
          50:  '#f5f0e8',
          100: '#e8dcc5',
          200: '#d4c09f',
          300: '#bfa479',
          400: '#b09060',
          500: '#9e7c4a',
          600: '#8a6a3d',
          700: '#725730',
          800: '#5a4525',
          900: '#42331b',
        },
        craft: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
