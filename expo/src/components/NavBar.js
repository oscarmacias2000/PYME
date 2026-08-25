import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useNavigation, useNavigationState } from '@react-navigation/native';

import BuildWiseLogo from './BuildWiseLogo';
import Dropdown from './ui/Dropdown';
import Avatar from './ui/Avatar';
import { useAuth } from '../context/AuthContext';
import { SERVICES } from '../constants/services';
import { DOCS } from '../constants/docs';

/**
 * Barra superior estilo IBM Carbon, marca BuildWise Labs.
 * Enlaces con desglose (Servicios) y area de autenticacion.
 */
export default function NavBar() {
  const navigation = useNavigation();
  const current = useNavigationState((s) => s.routes[s.index]?.name);
  const { isAuthenticated, user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const go = (name, params) => navigation.navigate(name, params);

  const NavLink = ({ name, label }) => {
    const active = current === name;
    return (
      <Pressable
        onPress={() => go(name)}
        className={`h-full justify-center px-3 ${
          active ? 'border-b-2 border-carbon-blue' : ''
        }`}
      >
        <Text
          className={`text-[14px] ${
            active
              ? 'font-plexsemibold text-carbon-black dark:text-white'
              : 'font-plex text-carbon-gray70 dark:text-carbon-gray20'
          }`}
        >
          {label || name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="z-20 h-12 w-full flex-row items-center justify-between border-b border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black pl-4 pr-2">
      {/* Marca (logo claro en modo oscuro, oscuro en modo claro) */}
      <Pressable className="flex-row items-center" onPress={() => go('Inicio')}>
        <BuildWiseLogo height={26} variant={isDark ? 'light' : 'dark'} />
      </Pressable>

      {/* Enlaces */}
      <View className="h-full flex-row items-stretch">
        <NavLink name="Inicio" />

        {/* Servicios con desglose */}
        <Dropdown
          width={280}
          trigger={(open) => (
            <View
              className={`h-full flex-row items-center px-3 ${
                current === 'Servicios' ? 'border-b-2 border-carbon-blue' : ''
              }`}
            >
              <Text
                className={`text-[14px] ${
                  current === 'Servicios'
                    ? 'font-plexsemibold text-carbon-black dark:text-white'
                    : 'font-plex text-carbon-gray70 dark:text-carbon-gray20'
                }`}
              >
                Servicios
              </Text>
              <Ionicons
                name={open ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#525252"
                style={{ marginLeft: 4 }}
              />
            </View>
          )}
        >
          {(close) => (
            <View className="py-1">
              <Pressable
                className="px-4 py-3 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                onPress={() => {
                  close();
                  go('Servicios');
                }}
              >
                <Text className="font-plexsemibold text-[14px] text-carbon-black dark:text-white">
                  Todos los servicios
                </Text>
              </Pressable>
              <View className="my-1 h-px bg-carbon-gray20 dark:bg-carbon-gray90" />
              {SERVICES.map((s) => (
                <Pressable
                  key={s.id}
                  className="flex-row items-center gap-3 px-4 py-3 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                  onPress={() => {
                    close();
                    go('Servicio', { id: s.id });
                  }}
                >
                  <Ionicons name={s.icon} size={18} color="#c026d3" />
                  <Text className="flex-1 font-plex text-[14px] text-carbon-gray90 dark:text-carbon-gray20">
                    {s.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Dropdown>

        {/* Docs con desglose */}
        <Dropdown
          width={300}
          trigger={(open) => (
            <View
              className={`h-full flex-row items-center px-3 ${
                current === 'Docs' ? 'border-b-2 border-carbon-blue' : ''
              }`}
            >
              <Text
                className={`text-[14px] ${
                  current === 'Docs'
                    ? 'font-plexsemibold text-carbon-black dark:text-white'
                    : 'font-plex text-carbon-gray70 dark:text-carbon-gray20'
                }`}
              >
                Docs
              </Text>
              <Ionicons
                name={open ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#525252"
                style={{ marginLeft: 4 }}
              />
            </View>
          )}
        >
          {(close) => (
            <View className="py-1">
              <Pressable
                className="px-4 py-3 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                onPress={() => {
                  close();
                  go('Docs');
                }}
              >
                <Text className="font-plexsemibold text-[14px] text-carbon-black dark:text-white">
                  Toda la documentacion
                </Text>
              </Pressable>
              <View className="my-1 h-px bg-carbon-gray20 dark:bg-carbon-gray90" />
              {DOCS.map((d) => (
                <Pressable
                  key={d.id}
                  className="flex-row items-center gap-3 px-4 py-3 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                  onPress={() => {
                    close();
                    go('Docs', { focus: d.id });
                  }}
                >
                  <Ionicons name={d.icon} size={18} color="#c026d3" />
                  <Text className="flex-1 font-plex text-[14px] text-carbon-gray90 dark:text-carbon-gray20">
                    {d.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Dropdown>

        <NavLink name="Nosotros" />
        <NavLink name="Contacto" />

        {/* Toggle de tema claro/oscuro */}
        <Pressable
          onPress={toggleColorScheme}
          accessibilityLabel="Cambiar tema"
          className="h-full items-center justify-center px-3"
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={isDark ? '#f4f4f4' : '#161616'}
          />
        </Pressable>

        {/* Separador */}
        <View className="mx-1 my-3 w-px bg-carbon-gray20 dark:bg-carbon-gray90" />

        {/* Area de autenticacion */}
        {isAuthenticated ? (
          <Dropdown
            align="right"
            width={220}
            trigger={() => (
              <View className="h-full flex-row items-center gap-2 px-2">
                <Avatar
                  initials={user.initials}
                  photo={user.photo}
                  bg={user.avatarColor || undefined}
                  size={28}
                />
                <Text className="hidden font-plex text-[14px] text-carbon-black dark:text-white md:flex">
                  {user.name}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#525252" />
              </View>
            )}
          >
            {(close) => (
              <View className="py-1">
                <View className="border-b border-carbon-gray20 dark:border-carbon-gray90 px-4 py-3">
                  <Text className="font-plexsemibold text-[14px] text-carbon-black dark:text-white">
                    {user.name}
                  </Text>
                  <Text className="mt-0.5 font-plex text-[12px] text-carbon-gray70 dark:text-carbon-gray20">
                    {user.email}
                  </Text>
                </View>
                <MenuItem
                  icon="person-outline"
                  label="Perfil"
                  onPress={() => {
                    close();
                    go('Perfil');
                  }}
                />
                <MenuItem
                  icon="log-out-outline"
                  label="Cerrar sesion"
                  danger
                  onPress={() => {
                    close();
                    logout();
                    go('Inicio');
                  }}
                />
              </View>
            )}
          </Dropdown>
        ) : (
          <Pressable
            onPress={() => go('Login')}
            className="h-full flex-row items-center gap-2 bg-carbon-blue px-4 hover:bg-carbon-bluehover"
          >
            <Text className="font-plex text-[14px] text-white">
              Iniciar sesion
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger }) {
  const { colorScheme } = useColorScheme();
  const iconColor = danger
    ? '#da1e28'
    : colorScheme === 'dark'
      ? '#f4f4f4'
      : '#161616';
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
    >
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text
        className={`font-plex text-[14px] ${
          danger ? 'text-carbon-red' : 'text-carbon-black dark:text-white'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
