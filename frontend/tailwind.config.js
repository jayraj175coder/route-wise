/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030B1C',
          900: '#071A3D',
          800: '#0D275A',
          700: '#14387D',
          600: '#1F4EA3',
        },
        brand: {
          orange: '#FF8C42',
          orangeHover: '#FFA05C',
          cyan: '#00F2FE',
          emerald: '#10B981',
          rose: '#EF4444',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 140, 66, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
