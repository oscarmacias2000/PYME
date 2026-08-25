import { Platform } from 'react-native';

// Almacenamiento simple del token. En web usa localStorage; en nativo,
// memoria (suficiente por sesion; migrar a expo-secure-store si se necesita
// persistencia real en el dispositivo).
const mem = {};
const hasLS = Platform.OS === 'web' && typeof localStorage !== 'undefined';

export const storage = {
  get: (key) => (hasLS ? localStorage.getItem(key) : mem[key] ?? null),
  set: (key, value) => {
    if (hasLS) localStorage.setItem(key, value);
    else mem[key] = value;
  },
  del: (key) => {
    if (hasLS) localStorage.removeItem(key);
    else delete mem[key];
  },
};
