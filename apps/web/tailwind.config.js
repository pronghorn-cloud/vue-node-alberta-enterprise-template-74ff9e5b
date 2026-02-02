/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'alberta-blue': '#007AC2',
        'alberta-teal': '#00ADEF',
        'alberta-darkblue': '#005A8C',
      },
      fontFamily: {
        sans: ['acumin-pro-semi-condensed', 'Acumin Pro SemiCondensed', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
