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
          bg: '#090d16',
          card: '#111827',
          surface: '#1f2937',
          border: '#374151',
          text: '#f3f4f6',
          muted: '#9ca3af',
        },
        status: {
          available: '#10b981', // emerald-500
          occupied: '#f43f5e',  // rose-500
          reserved: '#f59e0b',  // amber-500
          offline: '#6b7280',   // gray-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
