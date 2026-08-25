# 📱 Prompts para Expo

Colección de prompts para desarrollar, configurar y optimizar aplicaciones con Expo (React Native).

---

## 1. Configuración inicial de Expo

> **“Actúa como un experto en Expo. Genera una guía paso a paso para iniciar un proyecto Expo desde cero con:**
> - **Tipo de proyecto:** [managed / bare / Expo Router]
> - **Plantilla:** [blank / tabs / minimal]
> - **TypeScript** habilitado
> - **Configuración** de navegación inicial
> - **Estructura** de carpetas recomendada”

**Ejemplo:**
> “Actúa como un experto en Expo. Genera una guía paso a paso para iniciar un proyecto Expo desde cero con **Expo Router y TypeScript**. Incluye configuración de navegación inicial y estructura de carpetas recomendada.”

---

## 2. Configuración de `app.json` / `app.config.js`

> **“Genera un archivo `app.config.js` completo para una app Expo con:**
> - **Configuración de nombre, slug, version**
> - **Iconos y splash screen** (tamaños requeridos)
> - **Permisos** (Android + iOS)
> - **Configuración de orientación** y status bar
> - **Variables de entorno** (usando `extra`)
> - **Plugins** para funcionalidades nativas”

---

## 3. Expo Router (Sistema de archivos)

> **“Diseña una estructura de navegación completa con Expo Router para una app que tiene:**
> - **Auth flow** (login/registro)
> - **Tabs** principales (Home, Perfil, Configuración)
> - **Modal** para crear contenido
> - **Deep linking** configurado
> - **Protección de rutas** (autenticación)
> 
> Genera todos los archivos necesarios con ejemplos de código.”

---

## 4. EAS Build (Expo Application Services)

> **“Genera una configuración completa de EAS Build para una app Expo con:**
> - **Perfiles:** desarrollo, preview, producción
> - **Configuración de credenciales** (Android + iOS)
> - **Variables de entorno** por perfil
> - **Configuración de notificaciones push**
> - **Submit** a las stores (App Store + Google Play)
> - **EAS Update** para OTA updates”

---

## 5. Notificaciones push con Expo

> **“Implementa notificaciones push en una app Expo. Incluye:**
> - **Configuración** en `app.json`
> - **Código para solicitar permisos**
> - **Manejo de tokens** (guardar en backend)
> - **Recepción de notificaciones** en foreground/background
> - **Ejemplo de backend** para enviar notificaciones
> - **Manejo de deep linking** desde notificaciones”

---

## 6. Autenticación con Expo

> **“Implementa un sistema de autenticación completo en Expo con:**
> - **Login/Registro** con email y password
> - **OAuth** con Google/Apple (expo-auth-session)
> - **Manejo de sesión** (expo-secure-store)
> - **Protección de rutas** con Expo Router
> - **Refresco de token** automático
> - **Logout** y limpieza de estado”

---

## 7. Configuración de Firebase con Expo

> **“Integra Firebase en una app Expo (managed workflow). Incluye:**
> - **Dependencias** necesarias (expo-firebase-analytics, expo-firebase-auth, etc.)
> - **Configuración** de `GoogleService-Info.plist` y `google-services.json`
> - **Inicialización** de Firebase
> - **Autenticación** con Firebase Auth
> - **Firestore** / **Realtime Database** básico
> - **Storage** para imágenes
> - **Manejo de errores** y validaciones”

---

## 8. Cámara y galería con Expo

> **“Implementa funcionalidad de cámara y galería en Expo con:**
> - **expo-image-picker** para seleccionar imágenes
> - **expo-camera** para tomar fotos/videos
> - **expo-image-manipulator** para editar imágenes (crop, resize)
> - **expo-file-system** para guardar archivos localmente
> - **Subida a Firebase Storage** o backend”
> - **
> - **