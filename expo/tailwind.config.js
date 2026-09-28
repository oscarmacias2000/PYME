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
      // Radios suaves estilo "Astra" para tarjetas y paneles destacados.
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      full: '9999px',
    },
    extend: {
      colors: {
        // Tokens de color de Carbon Design System.
        carbon: {
          black: '#161616', // gray-100 (texto / footer)
          white: '#ffffff',
          blue: '#9d6b99', // malva tenue (primario; paleta Stitch "Malva y pizarra")
          bluehover: '#86597f', // malva mas oscuro (hover)
          electric: '#7088b3', // azul pizarra (secundario)
          electrichover: '#5c739c', // azul pizarra mas oscuro
          gray10: '#f4f4f4', // layer / fondos suaves
          gray20: '#e0e0e0', // bordes
          gray50: '#8d8d8d',
          gray70: '#525252', // texto secundario
          gray90: '#262626',
          night: '#0c0e14', // fondo espacial (hero / paneles estilo Astra)
          nightcard: '#151824', // tarjeta sobre fondo espacial
          star: '#93a4c2', // acento pizarra claro de estrellas
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
