/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rutas que Tailwind escanea en busca de clases utilitarias.
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    // Carbon Design System (IBM) usa esquinas rectas por defecto.
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '0px',
      full: '9999px',
    },
    extend: {
      colors: {
        // Tokens de color de Carbon Design System.
        carbon: {
          black: '#161616', // gray-100 (texto / footer)
          white: '#ffffff',
          blue: '#c026d3', // magenta (primario, como el logo)
          bluehover: '#a21caf', // magenta mas oscuro (hover)
          electric: '#2f6bf5', // azul electrico (secundario)
          electrichover: '#1d4fd8', // azul electrico mas oscuro
          gray10: '#f4f4f4', // layer / fondos suaves
          gray20: '#e0e0e0', // bordes
          gray50: '#8d8d8d',
          gray70: '#525252', // texto secundario
          gray90: '#262626',
          red: '#da1e28', // error
          green: '#24a148', // success
        },
      },
      fontFamily: {
        // Familias cargadas con expo-font (nombres = claves de useFonts).
        // El primer nombre se usa en nativo; en web se emite todo el stack.
        plex: ['IBMPlexSans_400Regular', 'IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        plexlight: ['IBMPlexSans_300Light', 'IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        plexsemibold: ['IBMPlexSans_600SemiBold', 'IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        plexbold: ['IBMPlexSans_700Bold', 'IBM Plex Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
