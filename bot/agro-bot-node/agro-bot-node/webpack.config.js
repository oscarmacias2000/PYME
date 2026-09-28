const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    index: './frontend/js/pages/index.js',
    login: './frontend/js/pages/login.js',
    actividad: './frontend/js/pages/actividad.js',
    monitoreo: './frontend/js/pages/monitoreo.js',
  },
  output: {
    path: path.resolve(__dirname, 'src/public/js/dist'),
    // [contenthash] en el nombre del archivo (no un "?v=" en la URL) -- el cache de
    // Hostinger/LiteSpeed ignora el query string al decidir si ya tiene el archivo, asi
    // que la unica forma de que SIEMPRE detecte un archivo distinto cuando el bundle
    // cambia es que el nombre real cambie. "clean: true" borra los bundles/.map de un
    // build anterior antes de generar los nuevos, para no ir acumulando archivos sueltos
    // con hashes viejos (ver scripts/set-cache-bust.js, que hace lo mismo para el CSS).
    filename: '[name].[contenthash:8].bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // El package.json del proyecto tiene "type": "commonjs" (asi debe quedar, el
        // servidor Node -- src/server.js, etc. -- usa require/module.exports de toda la
        // vida). Pero eso tambien le dice a Webpack 5 que trate CUALQUIER .js como
        // CommonJS "estricto" por default (no permite import/export, truena con "'import'
        // and 'export' may appear only with 'sourceType: module'"), y frontend/js/tema.js
        // + los 3 entry points SI usan import/export de verdad. "javascript/auto" hace que
        // Webpack acepte ambos estilos en estos archivos, sin tocar el "type" del
        // package.json (que el servidor si necesita).
        type: 'javascript/auto',
        use: { loader: 'babel-loader' },
      },
    ],
  },
  devtool: 'source-map',
};
