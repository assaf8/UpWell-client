/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#00969E',
          tealDark: '#007A81',
          tealLight: '#E6F7F8',
          green: '#22C55E',
        },
      },
    },
  },
  plugins: [],
}
