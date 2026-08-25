import { Image } from 'react-native';

// Relacion de aspecto del logo recortado (1430 x 262).
const ASPECT = 1430 / 262;

/**
 * Logo BuildWise (imagen).
 * @param {number} height  alto en px (el ancho se calcula por el aspecto)
 * @param {'dark'|'light'} variant  'dark' = texto oscuro (fondos claros);
 *   'light' = texto blanco (fondos oscuros)
 */
export default function BuildWiseLogo({ height = 24, variant = 'dark' }) {
  const source =
    variant === 'light'
      ? require('../../assets/buildwise-light.png')
      : require('../../assets/buildwise-dark.png');

  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{ height, width: height * ASPECT }}
      accessibilityLabel="BuildWise"
    />
  );
}
