# 🔧 Prompts para Babel

Colección de prompts para configurar, optimizar y solucionar problemas con Babel.

---

## 1. Configuración básica de Babel

> **“Actúa como un experto en Babel. Genera un archivo `babel.config.js` básico para un proyecto [Node.js / React / Next.js / TypeScript]. Incluye los presets necesarios y los plugins más comunes. Explica cada opción y su propósito.”**

**Ejemplo:**
> “Actúa como un experto en Babel. Genera un archivo `babel.config.js` básico para un proyecto **React con TypeScript**. Incluye los presets necesarios y los plugins más comunes. Explica cada opción y su propósito.”

---

## 2. Configuración para entorno específico

> **“Genera una configuración de Babel para [entorno: desarrollo / producción / testing]. Incluye:**
> - **Optimizaciones** para producción (tree-shaking, eliminación de console.log)
> - **Source maps** para desarrollo
> - **Hot reloading** si aplica
> - **Variables de entorno** diferenciadas”

---

## 3. Plugins personalizados

> **“Necesito crear un plugin personalizado de Babel que [describir funcionalidad: transforme JSX, elimine imports, añada logs, etc.]. Genera el código del plugin, explica cómo funciona y cómo integrarlo en la configuración.”**

**Ejemplo:**
> “Necesito crear un plugin personalizado de Babel que **elimine automáticamente todos los `console.log` en producción**. Genera el código del plugin, explica cómo funciona y cómo integrarlo en la configuración.”

---

## 4. Migrar de JavaScript a TypeScript con Babel

> **“Genera una configuración de Babel para migrar un proyecto de JavaScript a TypeScript gradualmente. Incluye:**
> - Soporte para archivos `.js` y `.ts` mezclados
> - Type checking opcional
> - Transformación de JSX
> - Decorators (si aplica)
> - Explicación paso a paso para la migración”

---

## 5. Babel para React Native / Expo

> **“Genera una configuración de Babel optimizada para React Native / Expo. Incluye:**
> - Soporte para JSX y TypeScript
> - Transformaciones específicas para RN (react-native-reanimated, react-native-screens)
> - Configuración para aliases de imports (`module-resolver`)
> - Eliminación de logs en producción
> - Soporte para decorators y class properties”

---

## 6. Babel + Webpack

> **“Genera una configuración de Babel integrada con Webpack. Incluye:**
> - `babel-loader` configurado
> - Caching para mejorar el rendimiento
> - Separación de configuraciones por entorno
> - Soporte para HMR (Hot Module Replacement)
> - Explicación de cada parte de la configuración”

---

## 7. Resolución de errores comunes

> **“Estoy teniendo este error con Babel: [pegar error]. Analiza el error, explica su causa y proporciona las soluciones posibles. Incluye ejemplos de código corregido y cómo modificar la configuración para evitarlo.”**

---

## 8. Babel para librerías / paquetes NPM

> **“Genera una configuración de Babel para publicar una librería en NPM. Incluye:**
> - Compilación a ES5 y módulos CommonJS + ESM
> - Generación de archivos `.d.ts` para TypeScript
> - Exclusión de tests y archivos innecesarios
> - Optimización para reducir el tamaño del bundle
> - Configuración de `package.json` para los entry points”

---

## 9. Performance y optimización

> **“Optimiza esta configuración de Babel para mejorar el rendimiento del build: [pegar configuración]. Sugiere:**
> - Plugins que se pueden eliminar
> - Configuración de caching
> - Uso de `babel-preset-env` con browserslist
> - Alternativas más rápidas para transformaciones específicas
> - Estrategias para parallel builds”

---

## 10. Babel con macros

> **“Explica cómo usar Babel macros en un proyecto [React / Node]. Genera:**
> - Configuración necesaria
> - Ejemplo de un macro personalizado
> - Casos de uso prácticos (ej: `import` condicional, strings en tiempo de compilación)
> - Ventajas y desventajas vs plugins tradicionales”

---

## 11. Configuración para monorepos

> **“Diseña una estrategia de configuración de Babel para un monorepo con [X] paquetes. Incluye:**
> - Configuración centralizada en la raíz
> - Sobrescritura por paquete si es necesario
> - Compilación con referencias cruzadas
> - Integración con Yarn Workspaces o pnpm
> - Ejemplo práctico con estructura de carpetas”

---

## 12. Migrar de Babel 6 a Babel 7

> **“Tengo esta configuración de Babel 6: [pegar config]. Genérame la versión equivalente para Babel 7. Incluye:**
> - Cambios de nombres de presets y plugins
> - Nuevas opciones disponibles
> - Plugin de proposal stages actualizados
> - Pasos para la migración y posibles breaking changes”

---

## 13. Decorators y class properties

> **“Configura Babel para soportar decorators y class properties en un proyecto [JavaScript / TypeScript]. Incluye:**
> - Los plugins necesarios con sus opciones
> - Explicación de las diferencias entre stage 1, 2 y 3
> - Ejemplos de código usando decorators
> - Advertencias sobre estabilidad y compatibilidad”

---

## 14. Babel para serverless / AWS Lambda

> **“Genera una configuración de Babel optimizada para funciones serverless (AWS Lambda, Cloud Functions). Incluye:**
> - Target específico para Node.js [versión]
> - Eliminación de dependencias innecesarias
> - Bundling con Webpack o esbuild
> - Minimización del tamaño del deployment
> - Configuración de source maps opcionales”

---

## 15. Babel + ESLint + Prettier

> **“Genera la configuración integrada de Babel, ESLint y Prettier para un proyecto [React / Node]. Incluye:**
> - Todos los archivos de configuración
> - Dependencias necesarias (devDependencies)
> - Scripts en `package.json`
> - Explicación de cómo se complementan las herramientas”