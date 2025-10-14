/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F62FE',
          foreground: '#ffffff',
        },
        surface: '#0B1728',
        sidebar: '#0E213E',
        accent: '#5E81F4',
      },
    },
  },
  plugins: [],
}
