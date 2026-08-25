import { createContext, useContext, useState, useMemo, useEffect } from 'react';

import { api } from '../services/api';

const AuthContext = createContext(null);

// Anade iniciales calculadas al usuario (para el avatar).
function withInitials(u) {
  if (!u) return null;
  const initials = (u.name || u.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return { ...u, initials };
}

/**
 * Autenticacion real contra el backend (JWT). Guarda el token y restaura la
 * sesion al iniciar la app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Al montar: si hay token, intenta recuperar la sesion.
  useEffect(() => {
    (async () => {
      const token = await api.getToken();
      if (token) {
        try {
          const { user } = await api.me();
          setUser(withInitials(user));
        } catch {
          await api.clearToken();
        }
      }
      setReady(true);
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated: !!user,

      login: async ({ email, password }) => {
        const { token, user } = await api.login({ email, password });
        await api.saveToken(token);
        setUser(withInitials(user));
        return user;
      },

      register: async ({ name, email, password }) => {
        const { token, user } = await api.register({ name, email, password });
        await api.saveToken(token);
        setUser(withInitials(user));
        return user;
      },

      // Actualiza el perfil (nombre, foto, color de avatar) en el backend.
      updateProfile: async (patch) => {
        const { user } = await api.updateProfile(patch);
        setUser(withInitials(user));
        return user;
      },

      logout: async () => {
        await api.clearToken();
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
