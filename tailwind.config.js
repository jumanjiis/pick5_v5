/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dropdown-bg': 'rgba(255, 255, 255, 0.1)',
        'dropdown-hover': 'rgba(255, 255, 255, 0.2)',
      },
      backgroundColor: {
        'option-bg': '#312e81', // Indigo 900
      }
    },
  },
  plugins: [],
};