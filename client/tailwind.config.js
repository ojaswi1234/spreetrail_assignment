/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          yellow: '#fde047',
          pink: '#f472b6',
          blue: '#38bdf8',
          green: '#4ade80',
          orange: '#fb923c',
          bg: '#fffbeb',
        }
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-hover': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-lg': '12px 12px 0px 0px rgba(0, 0, 0, 1)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
