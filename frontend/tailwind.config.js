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
        primary: {
          DEFAULT: '#00D9FF',
          dark: '#008080',
          light: '#60C9CD',
        },
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          teal: '#00C2CB',
        },
        background: {
          DEFAULT: '#050505',
          secondary: '#0A0A0A',
          card: '#0F1419',
          elevated: '#121620',
        },
        border: {
          DEFAULT: '#1E2433',
          light: 'rgba(0, 217, 255, 0.1)',
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.87)',
          secondary: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Bricolage Grotesque', 'sans-serif'],
        albert: ['Albert Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00D9FF 0%, #0099CC 100%)',
        'gradient-card': 'linear-gradient(0deg, rgba(0, 128, 128, 0.22) 62.5%, rgba(1, 1, 1, 0.22) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A1628 0%, #0F1F3D 100%)',
      },
      boxShadow: {
        'glow-blue': '-3px -2px 12px rgba(0, 194, 203, 0.18), -1px -2px 12px rgba(0, 194, 203, 0.29)',
        'glow-blue-hover': '-1px -2px 16px rgba(0, 194, 203, 0.4), -3px -2px 16px rgba(0, 194, 203, 0.25)',
        'inset-teal': 'inset 2px -2px 4px rgb(2, 43, 45), inset -2px 2px 4px rgba(13, 133, 137), inset -2px -2px 5px rgb(2, 43, 45)',
        'inset-teal-hover': 'inset 2px -2px 4px rgba(15, 139, 144, 0.25), inset -2px 2px 4px rgba(15, 139, 144, 0.25), inset -2px -2px 5px rgba(15, 139, 144, 0.9)',
      },
      backdropBlur: {
        'xs': '6px',
      },
    },
  },
  plugins: [],
}
