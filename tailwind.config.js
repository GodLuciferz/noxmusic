/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#111111',
        card: '#1A1A1A',
        border: '#222222',
        accent: '#6C63FF',
      },
    },
  },
  plugins: [],
};
