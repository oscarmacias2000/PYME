/** @type {import('tailwindcss').Config} */
module.exports = {
  // Modo oscuro por clase (.dark en <html>, ver frontend/js/tema.js) en vez de seguir
  // la preferencia del sistema operativo -- asi el boton de la app manda, no el SO.
  darkMode: 'class',
  content: [
    './src/public/**/*.html',
    './frontend/js/**/*.js',
  ],
  theme: {
    extend: {
      // Tipografia: Inter (cargada por Google Fonts en cada <head>) con la misma pila de
      // respaldo de antes por si el link de la fuente tarda o falla en cargar.
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      // Sombras un poco mas cuidadas que las de Tailwind por defecto (shadow-sm/shadow-lg
      // a secas) -- se usan en .card / .card-hover / .card-elevated (ver frontend/styles/main.css).
      boxShadow: {
        soft: '0 1px 2px rgba(28,25,23,0.04), 0 4px 16px rgba(28,25,23,0.06)',
        'soft-lg': '0 2px 8px rgba(28,25,23,0.06), 0 12px 32px rgba(28,25,23,0.10)',
      },
      keyframes: {
        logoPulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: .5, transform: 'scale(.93)' },
        },
        skeletonShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Entrada suave para tarjetas clave (login, estado de actividad) -- se usa con
        // la clase .card-enter, ver frontend/styles/main.css.
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'logo-pulse': 'logoPulse 1.3s ease-in-out infinite',
        'skeleton-shimmer': 'skeletonShimmer 1.4s ease infinite',
        'fade-in-up': 'fadeInUp .45s ease-out both',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
};
