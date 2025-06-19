/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wordle-green': '#6aaa64',
        'wordle-yellow': '#c9b458',
        'wordle-gray': '#787c7e',
        'wordle-dark': '#121213',
        'wordle-light': '#d3d6da'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
} 