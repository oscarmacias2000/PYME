import { useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
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

  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (name, params) => {
    setMenuOpen(false);
    navigation.navigate(name, params);
  };

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
    <View className="z-20 w-full">
      {/* Franja de marca: malva + azul pizarra */}
      <View className="h-[3px] w-full flex-row">
        <View className="flex-[2] bg-carbon-blue" />
        <View className="flex-1 bg-carbon-electric" />
      </View>

      <View className="h-14 w-full flex-row items-center justify-between border-b border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black pl-5 pr-2">
      {/* Marca (logo claro en modo oscuro, oscuro en modo claro) */}
      <Pressable className="flex-row items-center" onPress={() => go('Inicio')}>
        <BuildWiseLogo height={26} variant={isDark ? 'light' : 'dark'} />
      </Pressable>

      {!isWide ? (
        <View className="h-full flex-row items-center">
          <ThemeToggle isDark={isDark} onPress={toggleColorScheme} />
          <Pressable
            onPress={() => setMenuOpen((o) => !o)}
            accessibilityLabel={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            className="h-full items-center justify-center px-3"
          >
            <Ionicons
              name={menuOpen ? 'close' : 'menu'}
              size={26}
              color={isDark ? '#f4f4f4' : '#161616'}
            />
          </Pressable>
        </View>
      ) : (
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
                  <Ionicons name={s.icon} size={18} color="#9d6b99" />
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
                  <Ionicons name={d.icon} size={18} color="#9d6b99" />
                  <Text className="flex-1 font-plex text-[14px] text-carbon-gray90 dark:text-carbon-gray20">
                    {d.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Dropdown>

        <NavLink name="Contacto" />

        {/* Toggle de tema claro/oscuro */}
        <ThemeToggle isDark={isDark} onPress={toggleColorScheme} />

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
            className="my-2.5 ml-2 flex-row items-center gap-2 rounded-full bg-carbon-blue px-5 hover:bg-carbon-bluehover"
          >
            <Text className="font-plexsemibold text-[14px] text-white">
              Iniciar sesion
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </Pressable>
        )}
      </View>
      )}
      </View>

      {/* Panel movil */}
      {!isWide && menuOpen ? (
        <MobileMenu
          current={current}
          go={go}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={() => {
            logout();
            go('Inicio');
          }}
        />
      ) : null}
    </View>
  );
}

function ThemeToggle({ isDark, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Cambiar tema"
      className="h-full items-center justify-center px-3"
    >
      <Ionicons
        name={isDark ? 'sunny-outline' : 'moon-outline'}
        size={20}
        color={isDark ? '#f4f4f4' : '#161616'}
      />
    </Pressable>
  );
}

/** Menu desplegable a todo el ancho para pantallas < 900px. */
function MobileMenu({ current, go, isAuthenticated, user, onLogout }) {
  const [servicesOpen, setServicesOpen] = useState(false);

  const Item = ({ name, label }) => (
    <Pressable
      onPress={() => go(name)}
      className={`flex-row items-center justify-between border-b border-carbon-gray20 dark:border-carbon-gray90 px-5 py-4 ${
        current === name ? 'border-l-4 border-l-carbon-blue' : ''
      }`}
    >
      <Text className="font-plexsemibold text-base text-carbon-black dark:text-white">
        {label || name}
      </Text>
      <Ionicons name="arrow-forward" size={18} color="#8d8d8d" />
    </Pressable>
  );

  return (
    <View className="absolute left-0 right-0 top-[59px] z-30 border-b border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black">
      <Item name="Inicio" />

      <Pressable
        onPress={() => setServicesOpen((o) => !o)}
        className="flex-row items-center justify-between border-b border-carbon-gray20 dark:border-carbon-gray90 px-5 py-4"
      >
        <Text className="font-plexsemibold text-base text-carbon-black dark:text-white">
          Servicios
        </Text>
        <Ionicons
          name={servicesOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#8d8d8d"
        />
      </Pressable>
      {servicesOpen ? (
        <View className="bg-carbon-gray10 dark:bg-carbon-gray90">
          <Pressable className="px-8 py-3" onPress={() => go('Servicios')}>
            <Text className="font-plexsemibold text-sm text-carbon-blue">
              Todos los servicios
            </Text>
          </Pressable>
          {SERVICES.map((s) => (
            <Pressable
              key={s.id}
              className="flex-row items-center gap-3 px-8 py-3"
              onPress={() => go('Servicio', { id: s.id })}
            >
              <Ionicons name={s.icon} size={18} color="#9d6b99" />
              <Text className="flex-1 font-plex text-sm text-carbon-gray90 dark:text-carbon-gray20">
                {s.title}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Item name="Docs" />
      <Item name="Contacto" />

      <View className="p-5">
        {isAuthenticated ? (
          <View className="gap-3">
            <Pressable onPress={() => go('Perfil')} className="flex-row items-center gap-3">
              <Avatar
                initials={user.initials}
                photo={user.photo}
                bg={user.avatarColor || undefined}
                size={32}
              />
              <View className="flex-1">
                <Text className="font-plexsemibold text-sm text-carbon-black dark:text-white">
                  {user.name}
                </Text>
                <Text className="font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">
                  {user.email}
                </Text>
              </View>
            </Pressable>
            <Pressable onPress={onLogout} className="flex-row items-center gap-2 py-2">
              <Ionicons name="log-out-outline" size={18} color="#da1e28" />
              <Text className="font-plex text-sm text-carbon-red">Cerrar sesion</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => go('Login')}
            className="flex-row items-center justify-between rounded-full bg-carbon-blue px-5 py-3"
          >
            <Text className="font-plex text-[15px] text-white">Iniciar sesion</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
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
