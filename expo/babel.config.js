module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: nativewind habilita className en componentes RN.
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // babel-preset-expo agrega automaticamente el plugin de
    // react-native-reanimated / worklets si el paquete esta instalado.
  };
};
