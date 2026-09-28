// Configuracion de ESLint (flat config) para la app Expo.
// Base oficial: https://docs.expo.dev/guides/using-eslint/
// Uso:  npm run lint        (o `npx expo lint`)
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Globales de Node para los archivos que corren fuera de la app.
const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  exports: 'writable',
  __dirname: 'readonly',
  __filename: 'readonly',
  process: 'readonly',
  console: 'readonly',
};

module.exports = defineConfig([
  expoConfig,
  {
    // Builds, caches y archivos generados (no se editan a mano).
    ignores: [
      'dist/**',
      'dist-check/**',
      'web-build/**',
      '.expo/**',
      'node_modules/**',
      'src/constants/ownDocs.js', // generado por `npm run docs:sync`
      'src/constants/landMask.js', // mascara de tierra generada (datos)
    ],
  },

   {
    plugins: [ "jsx-a11y" ],
   },

  {
    // Reglas del React Compiler (eslint-plugin-react-hooks 7). El proyecto no
    // usa el compilador y el patron `useRef(new Animated.Value(0)).current` es
    // el estandar de React Native, asi que se reportan como advertencia.
    rules: {
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'jsx-a11y/alt-text': 'warn',
    },
  },
  {
    // Scripts y configuracion que ejecuta Node (CommonJS).
    files: [
      'scripts/**/*.js',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
    ],
    languageOptions: { sourceType: 'commonjs', globals: nodeGlobals },
  },
]);
