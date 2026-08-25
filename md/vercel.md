# 🚀 Prompts para Vercel + React

Colección de prompts específicos para desplegar, configurar, optimizar y solucionar problemas con proyectos **React** en Vercel.

---

## 📦 Despliegue y configuración

### 1. Despliegue inicial de React en Vercel

> **"Actúa como un experto en Vercel. Genera una guía paso a paso para desplegar un proyecto React en Vercel:**
> 
> **Requisitos:**
> - **Framework:** React (Create React App / Vite / custom)
> - **Repositorio:** [GitHub / GitLab / Bitbucket]
> - **Variables de entorno:** [listar variables necesarias, ej: REACT_APP_API_URL]
> - **Dominio personalizado:** [Sí / No]
> - **Región:** [us-east-1 / eu-west-1 / auto]
> 
> **Incluye:**
> - Configuración en `vercel.json`
> - Variables de entorno necesarias (REACT_APP_*)
> - Comandos de despliegue
> - Configuración de dominio personalizado
> - Configuración de análisis de performance"

**Ejemplo:**
> "Actúa como un experto en Vercel. Genera una guía paso a paso para desplegar un proyecto **React con Vite** en Vercel con:
> - **Variables de entorno:** REACT_APP_API_URL, REACT_APP_STRIPE_KEY
> - **Dominio personalizado:** miapp.com
> - **Región:** us-east-1
> 
> Incluye configuración en vercel.json, comandos de despliegue y configuración de dominio."

---

### 2. Configuración de `vercel.json` para React

> **"Genera un archivo `vercel.json` completo para un proyecto React que incluya:**
> - **Build command:** [npm run build / yarn build]
> - **Output directory:** [build / dist]
> - **Dev command:** [npm start / yarn dev]
> - **Install command:** [npm install / yarn install]
> - **SPA Routing:** rewrites para React Router
> - **Headers:** [CORS, security headers]
> - **Caching:** [cache control para assets estáticos]
> - **Regiones:** [múltiples regiones]
> 
> **Incluye:**
> - Comentarios explicando cada sección
> - Ejemplos de configuración común para React"

---

### 3. Variables de entorno en React + Vercel

> **"Explica cómo gestionar variables de entorno en React con Vercel:**
> 
> **Contenido:**
> - Diferencia entre variables de entorno en Vercel vs .env.local
> - Variables con prefijo REACT_APP_ (CRA) o VITE_ (Vite)
> - Variables de entorno para entornos específicos (production/preview)
> - Variables de entorno en Vercel CLI
> - Buenas prácticas de seguridad
> - Ejemplos de configuración por entorno
> 
> **Incluye:**
> - Ejemplos de `.env` por entorno
> - Configuración en `vercel.json`
> - Cómo acceder a variables en el código React"

---

### 4. Configuración de React Router en Vercel

> **"Configura React Router (BrowserRouter) en Vercel para que todas las rutas funcionen correctamente:**
> 
> **Requisitos:**
> - **React Router:** [v5 / v6]
> - **Modo:** BrowserRouter / HashRouter
> - **Rutas:** [ej: /, /about, /dashboard, /product/:id]
> 
> **Incluye:**
> - Configuración de rewrites en vercel.json
> - Ejemplo de rutas en React
> - Manejo de 404 personalizado
> - Configuración de redirects"

---

### 5. SPA (Single Page Application) en Vercel

> **"Configura una SPA en React con Vercel:**
> 
> **Características:**
> - Routing con React Router
> - Carga de assets estáticos
> - Manejo de 404 (redirigir a index.html)
> - Cacheo de archivos estáticos
> - Optimización de carga inicial
> 
> **Incluye:**
> - vercel.json para SPA
> - Ejemplo de estructura de proyecto
> - Estrategias de cacheo"

---

### 6. React + Vite en Vercel

> **"Configura un proyecto React con Vite en Vercel:**
> 
> **Requisitos:**
> - **Build command:** npm run build
> - **Output directory:** dist
> - **Variables de entorno:** VITE_ prefix
> - **SPA routing:** redirects para rutas
> - **Optimizaciones:** build específicas
> 
> **Incluye:**
> - vercel.json completo
> - vite.config.js optimizado
> - Configuración de rutas SPA
> - Ejemplo de despliegue
> - Optimizaciones específicas para Vite"

---

### 7. Create React App en Vercel

> **"Configura un proyecto Create React App en Vercel:**
> 
> **Requisitos:**
> - **Build command:** npm run build
> - **Output directory:** build
> - **Variables de entorno:** REACT_APP_ prefix
> - **Service Worker:** para PWA si aplica
> 
> **Incluye:**
> - vercel.json para CRA
> - Configuración de Service Worker
> - Estrategias de caching"

---

## ⚡ Optimización y performance

### 8. Optimización de performance en React + Vercel

> **"Actúa como un experto en optimización de Vercel. Optimiza un proyecto React para máximo rendimiento:**
> 
> **Áreas:**
> - **Code Splitting:** lazy loading con React.lazy()
> - **Image Optimization:** con librerías optimizadas
> - **Font Optimization:** fuentes auto-optimizadas
> - **Scripts:** estrategias de carga (defer/async)
> - **Bundle analysis:** reducción de tamaño
> - **Caching strategies:** headers, CDN
> - **Preconnect y Prefetch:** optimizaciones
> - **Edge Middleware:** para personalización
> 
> **Incluye:**
> - Configuraciones específicas en vercel.json
> - Ejemplos de código (React.lazy, Suspense)
> - Métricas a monitorear
> - Comparativa antes/después"

---

### 9. Code Splitting con React.lazy() y Suspense

> **"Implementa Code Splitting en React con Vercel:**
> 
> **Estrategias:**
> - React.lazy() + Suspense para componentes
> - Route-based code splitting
> - Named exports con React.lazy
> - Loading fallbacks
> - Prefetching de chunks
> - Error boundaries
> 
> **Incluye:**
> - Ejemplos de código
> - Configuración en vercel.json
> - Medición de impacto en performance"

---

### 10. Optimización de imágenes en React + Vercel

> **"Optimiza imágenes en React con Vercel:**
> 
> **Estrategias:**
> - Lazy loading de imágenes
> - WebP / AVIF conversion
> - Responsive images (srcset)
> - Imágenes optimizadas con librerías
> - Caching de imágenes
> - @vercel/og para Open Graph
> 
> **Incluye:**
> - Ejemplos de componentes de imagen
> - Configuración de vercel.json
> - Estrategias de carga"

---

### 11. Bundle Analysis en React

> **"Configura análisis de bundle en React con Vercel:**
> 
> **Herramientas:**
> - **@next/bundle-analyzer** (para React + Next)
> - **source-map-explorer**
> - **webpack-bundle-analyzer**
> - **@vercel/analytics**
> 
> **Estrategias:**
> - Identificar dependencias pesadas
> - Reducir tamaño de bundle
> - Code splitting efectivo
> - Tree shaking
> - Eliminar dependencias duplicadas
> 
> **Incluye:**
> - Scripts de análisis
> - Ejemplos de configuración
> - Reportes de bundle"

---

## 🔐 Seguridad y monitoreo

### 12. Security Headers para React en Vercel

> **"Configura security headers para una SPA React en Vercel:**
> 
> **Headers requeridos:**
> - CSP (Content Security Policy) para React
> - HSTS (HTTP Strict Transport Security)
> - X-Frame-Options (para evitar clickjacking)
> - X-Content-Type-Options
> - Referrer-Policy
> - Permissions-Policy
> 
> **Incluye:**
> - Configuración en vercel.json
> - Reglas CSP para React (incluyendo scripts inline)
> - Testing de headers
> - Reporte de violaciones CSP"

---

### 13. Monitoreo y análisis en React + Vercel

> **"Configura monitoreo y análisis para React en Vercel:**
> 
> **Herramientas:**
> - **Vercel Analytics:** configuración
> - **Vercel Speed Insights:** para métricas web
> - **React DevTools:** en producción
> - **Logs:** acceso, functions
> - **Alertas:** configuración de alertas
> - **Métricas personalizadas:** con @vercel/analytics
> 
> **Incluye:**
> - Configuración de analytics
> - Métricas clave (CLS, FID, LCP)
> - Dashboards recomendados
> - Integración con Sentry para errores"

---

### 14. Error Tracking en React + Vercel

> **"Implementa error tracking en React con Vercel:**
> 
> **Herramientas:**
> - **Sentry:** para errores en producción
> - **Error Boundaries:** en React
> - **Logging:** de errores en Vercel
> - **Alertas:** en caso de errores críticos
> 
> **Incluye:**
> - Configuración de Sentry para React
> - Error Boundaries en componentes
> - Manejo de errores en API calls
> - Dashboard de monitoreo"

---

## 🔄 Integraciones

### 15. React + API Backend en Vercel

> **"Configura un proyecto React con API backend en Vercel (Serverless Functions):**
> 
> **Estructura:**
> - **Frontend:** React en la raíz
> - **Backend:** Serverless Functions en /api
> - **CORS:** configurado correctamente
> - **Autenticación:** JWT o cookies
> 
> **Incluye:**
> - Estructura de carpetas
> - Código de Serverless Functions
> - Configuración de CORS
> - Ejemplos de fetch desde React
> - Variables de entorno"

---

### 16. React + Firebase en Vercel

> **"Conecta React con Firebase en Vercel:**
> 
> **Integraciones:**
> - Firebase Auth (autenticación)
> - Firestore (base de datos)
> - Firebase Storage (archivos)
> - Firebase Analytics
> - Variables de entorno para Firebase
> 
> **Incluye:**
> - Configuración de Firebase
> - Hooks de autenticación
> - Ejemplos de CRUD
> - Manejo de errores"

---

### 17. React + Supabase en Vercel

> **"Conecta React con Supabase en Vercel:**
> 
> **Integraciones:**
> - Supabase Auth (autenticación)
> - Supabase Database (PostgreSQL)
> - Supabase Storage (archivos)
> - Realtime subscriptions
> - Variables de entorno para Supabase
> 
> **Incluye:**
> - Configuración de Supabase
> - Hooks de autenticación
> - Ejemplos de queries
> - Realtime subscriptions"

---

### 18. React + Stripe en Vercel

> **"Implementa pagos con Stripe en React + Vercel:**
> 
> **Funcionalidades:**
> - Checkout de Stripe
> - Webhooks de Stripe (en Serverless Functions)
> - Manejo de suscripciones
> - Test mode y live mode
> - Variables de entorno para Stripe
> 
> **Incluye:**
> - Configuración de Stripe en React
> - Serverless Functions para webhooks
> - Ejemplos de checkout
> - Manejo de estados de pago"

---

### 19. React + CMS (Headless) en Vercel

> **"Conecta React con un Headless CMS en Vercel:**
> 
> **CMS:** [Contentful / Sanity / Strapi / WordPress]
> **Funcionalidades:**
> - Fetch de contenido desde React
> - Preview mode (para contenido en draft)
> - Webhooks para rebuild automático
> - Cacheo de contenido
> 
> **Incluye:**
> - Configuración del CMS
> - Hooks de fetching
> - Preview mode
> - Manejo de errores"

---

### 20. React + Vercel KV (Redis)

> **"Implementa Vercel KV (Redis) en React + Vercel:**
> 
> **Usos:**
> - Caching de respuestas API
> - Rate limiting
> - Sessions (si hay autenticación)
> - Feature flags
> - Cacheo de datos de CMS
> 
> **Incluye:**
> - Configuración de Vercel KV
> - Ejemplos de código con React y Serverless Functions
> - Estrategias de caching
> - Rate limiting"

---

### 21. React + Vercel Blob (Storage)

> **"Implementa Vercel Blob en React:**
> 
> **Usos:**
> - Upload de imágenes de usuarios
> - Subida de archivos
> - Almacenamiento de documentos
> - Optimización de imágenes
> 
> **Incluye:**
> - Configuración de Vercel Blob
> - Componente de upload en React
> - Manejo de archivos
> - Seguridad y permisos"

---

## 🎨 Framework específico: Vite + React

### 22. Vercel + Vite + React (configuración avanzada)

> **"Configura avanzadamente Vite + React en Vercel:**
> 
> **Características:**
> - **Build optimizado:** con Vite
> - **Variables de entorno:** VITE_ prefix
> - **Routing:** React Router v6
> - **State management:** Zustand / Redux / Context
> - **Styling:** Tailwind / CSS Modules / Styled Components
> - **PWA:** con Vite PWA plugin
> 
> **Incluye:**
> - vite.config.js optimizado
> - vercel.json completo
> - Ejemplos de componentes
> - Configuración de rutas"

---

## 🔧 Solución de problemas

### 23. Errores comunes en React + Vercel

> **"Actúa como un experto en troubleshooting de Vercel. Soluciona estos errores comunes en React:**
> 
> **Errores:**
> - `404 en rutas de React Router`
> - `Error: Failed to load module script`
> - `CORS error al llamar APIs`
> - `Memory limit exceeded`
> - `Cold starts en Serverless Functions`
> - `Variables de entorno no disponibles`
> - `Errores de build en Vite/CRA`
> - `Imágenes no se cargan en producción`
> 
> **Incluye:**
> - Causa raíz de cada error
> - Soluciones paso a paso
> - Configuraciones preventivas
> - Herramientas de debugging"

---

### 24. Debugging en React + Vercel

> **"Guía de debugging para React en Vercel:**
> 
> **Técnicas:**
> - Logs en Vercel Dashboard
> - React DevTools en producción
> - Console.logs y debugging
> - Source maps en producción
> - Testing local con Vercel Dev
> - Simulación de producción local
> - Monitoreo de performance
> 
> **Incluye:**
> - Configuraciones de debugging
> - Ejemplos de logs efectivos
> - Herramientas recomendadas
> - Estrategias de troubleshooting"

---

### 25. Migrar de Netlify a Vercel (React)

> **"Guía para migrar un proyecto React de Netlify a Vercel:**
> 
> **Pasos:**
> - Análisis de diferencias
> - Configuración equivalente (vercel.json)
> - Variables de entorno
> - Build y deployment
> - Dominio y DNS
> - Testing de funcionalidades
> - Configuración de redirects/rewrites
> 
> **Incluye:**
> - Checklist de migración
> - Configuraciones específicas
> - Rollback plan"

---

## 📝 Ejemplos de código para React

### Ejemplo 1: vercel.json para React (Vite)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@react_app_api_url",
    "REACT_APP_STRIPE_KEY": "@react_app_stripe_key"
  }
}