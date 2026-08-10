/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // پشتیبانی از تغییر تم با کلاس dark
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: {
          main: 'var(--color-text-main)',
          muted: 'var(--color-text-muted)'
        },
        border: 'var(--color-border)'
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      }
    },
  },
  plugins: [],
}