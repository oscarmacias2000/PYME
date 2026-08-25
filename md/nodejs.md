# 🟢 Prompts para Node.js

Colección de prompts para configurar, desarrollar, optimizar y desplegar aplicaciones con Node.js.

---

## 1. Configuración inicial de proyecto Node.js

> **“Actúa como un experto en Node.js. Genera una guía paso a paso para iniciar un proyecto Node.js desde cero con:**
> - **Tipo de proyecto:** [API REST / GraphQL / Microservicio / CLI]
> - **Gestor de paquetes:** [npm / yarn / pnpm]
> - **TypeScript** habilitado
> - **Estructura de carpetas** recomendada
> - **Scripts** en `package.json` (dev, build, start, test)
> - **Variables de entorno** con dotenv
> - **Configuración de ESLint y Prettier**”

**Ejemplo:**
> “Actúa como un experto en Node.js. Genera una guía paso a paso para iniciar un proyecto Node.js desde cero con **API REST en TypeScript**. Incluye estructura de carpetas, scripts en package.json, variables de entorno y configuración de ESLint.”

---

## 2. Configuración de TypeScript en Node.js

> **“Configura TypeScript en un proyecto Node.js con:**
> - **tsconfig.json** optimizado para Node
> - **Dependencias** necesarias (typescript, ts-node, @types/node)
> - **Scripts** de desarrollo y producción
> - **Source maps** para debugging
> - **Watch mode** para desarrollo
> - **Resolución de módulos** (paths, aliases)
> - **Estrategia** para archivos .js y .ts mixtos”

---

## 3. API REST con Express + TypeScript

> **“Genera una API REST completa con Express y TypeScript que incluya:**
> - **Estructura** MVC (Models, Controllers, Routes)
> - **Middlewares** (autenticación, logging, error handling)
> - **Validación** de datos (Joi / Zod / class-validator)
> - **Conexión** a base de datos [MongoDB / PostgreSQL / MySQL]
> - **Variables de entorno** con validación
> - **Documentación** con Swagger/OpenAPI
> - **Testing** con Jest/Supertest
> - **Rate limiting** y seguridad básica”

---

## 4. Autenticación y autorización

> **“Implementa un sistema de autenticación completo en Node.js con:**
> - **Registro y login** con email/password (bcrypt)
> - **JWT** (access + refresh tokens)
> - **Middleware** de autenticación
> - **Roles** y permisos (RBAC)
> - **Recuperación de contraseña** (email)
> - **Login social** (Google, GitHub) con Passport.js
> - **Logout** y revocación de tokens
> - **Protección** de rutas sensibles”

---

## 5. Conexión a bases de datos

> **“Configura la conexión a [MongoDB / PostgreSQL / MySQL] en Node.js con:**
> - **ORM/ODM:** [Prisma / TypeORM / Mongoose / Sequelize]
> - **Modelos** y esquemas
> - **Migraciones** y seeds
> - **Pool de conexiones**
> - **Transacciones**
> - **Logging** de queries
> - **Manejo de errores** específicos de DB
> - **Conexión** con variables de entorno
> - **Reintentos** y health checks”

---

## 6. Configuración de logging

> **“Implementa un sistema de logging robusto en Node.js con:**
> - **Winston** o **Pino**
> - **Niveles** de log (error, warn, info, debug)
> - **Transportes** (consola, archivo, servicios externos)
> - **Contexto** en logs (request ID, user ID)
> - **Rotación de logs**
> - **JSON format** para integración con herramientas
> - **Logging** de errores con stack trace
> - **Performance logging**”

---

## 7. Manejo de errores

> **“Diseña un sistema de manejo de errores para Node.js con:**
> - **Clases de error personalizadas** (HTTPError, ValidationError, etc.)
> - **Middleware** global de errores
> - **Formato** de respuesta consistente
> - **Logging** automático de errores
> - **Errores asíncronos** (async/await + try/catch)
> - **Rejection handling** global
> - **Errores de validación** con mensajes claros
> - **Error codes** específicos”

---

## 8. Variables de entorno y configuración

> **“Configura un sistema de gestión de variables de entorno en Node.js con:**
> - **dotenv** para desarrollo
> - **Validación** de variables (Joi / Zod)
> - **Entornos** diferenciados (development, staging, production)
> - **Valores por defecto** seguros
> - **Archivos** `.env.example`, `.env.development`, `.env.production`
> - **Configuración** centralizada en un módulo
> - **Secrets** para producción (AWS Secrets Manager, Vault)”

---

## 9. Testing en Node.js

> **“Configura un entorno de testing completo para Node.js con:**
> - **Jest** o **Vitest**
> - **Pruebas unitarias** de servicios y utilidades
> - **Pruebas de integración** con base de datos
> - **Pruebas E2E** con Supertest
> - **Mocks** y stubs
> - **Cobertura de código** (istanbul)
> - **Testing de errores** y casos borde
> - **Base de datos** de testing separada
> - **Cleanup** automático entre tests”

---

## 10. Dockerización de Node.js

> **“Genera un Dockerfile optimizado para una app Node.js con:**
> - **Multi-stage builds**
> - **Imagen base** ligera (alpine)
> - **Instalación** de dependencias (separando dev y prod)
> - **Variables de entorno** para diferentes entornos
> - **Health checks**
> - **docker-compose** para desarrollo con [base de datos / Redis / etc.]
> - **Volume mounts** para desarrollo
> - **Estrategia** de caching de capas”

---

## 11. Performance y optimización

> **“Optimiza una aplicación Node.js para producción con:**
> - **Cluster mode** para usar multi-core
> - **Memory profiling** y garbage collection
> - **Event loop** monitoring
> - **CPU profiling** con clinic.js o 0x
> - **Compresión** de respuestas (gzip/brotli)
> - **Caching** en memoria (node-cache) o Redis
> - **Async/await** para I/O no bloqueante
> - **Pooling** de conexiones a DB
> - **Optimización** de queries”

---

## 12. Seguridad en Node.js

> **“Implementa prácticas de seguridad en una API Node.js:**
> - **Helmet** para headers de seguridad
> - **CORS** configurado correctamente
> - **Rate limiting** (express-rate-limit)
> - **Validación y sanitización** de inputs
> - **Prevención** de inyección SQL/NoSQL
> - **XSS** y CSRF protection
> - **Content Security Policy**
> - **Manejo seguro** de secrets
> - **Dependencias** auditadas (npm audit)
> - **Logging** de eventos de seguridad”

---

## 13. WebSockets con Socket.io

> **“Implementa WebSockets en Node.js con Socket.io incluyendo:**
> - **Conexión** con autenticación JWT
> - **Salas** (rooms) para comunicación privada
> - **Eventos** personalizados
> - **Broadcast** a múltiples clientes
> - **Reconexión** automática
> - **Manejo** de desconexiones
> - **Middlewares** para Socket.io
> - **Emitir eventos** desde fuera del socket
> - **Escalabilidad** con Redis adapter”

---

## 14. GraphQL API

> **“Genera una API GraphQL completa con Node.js usando [Apollo Server / GraphQL Yoga] incluyendo:**
> - **Schema** definido con SDL o TypeScript
> - **Resolvers** con TypeScript
> - **Contexto** con autenticación
> - **Queries, Mutations y Subscriptions**
> - **DataLoader** para N+1 problem
> - **Validación** de inputs
> - **Error handling** personalizado
> - **Federation** para microservicios
> - **Testing** de resolvers”

---

## 15. Microservicios con Node.js

> **“Diseña una arquitectura de microservicios en Node.js con:**
> - **Comunicación** vía HTTP/REST y gRPC
> - **Message broker** (RabbitMQ, Kafka) para eventos
> - **API Gateway** con Express o Fastify
> - **Service Discovery** (Consul, etcd)
> - **Distributed tracing** (Jaeger, Zipkin)
> - **Circuit breaker** (opossum)
> - **Centralized logging** con ELK stack
> - **Docker Compose** para orquestación local
> - **Kubernetes** deployment”

---

## 16. Background jobs y colas

> **“Implementa un sistema de jobs en Node.js con:**
> - **Bull** o **Agenda** con Redis
> - **Tipos de jobs:** inmediatos, programados, recurrentes
> - **Prioridades** y retrasos
> - **Reintentos** con backoff exponencial
> - **Concurrencia** controlada
> - **Progreso** y estado de jobs
> - **Monitoreo** con UI de Bull
> - **Saneamiento** de jobs fallidos
> - **Integración** con la aplicación principal”

---

## 17. Cron jobs y tareas programadas

> **“Configura tareas programadas (cron jobs) en Node.js con:**
> - **node-cron** o **node-schedule**
> - **Tareas** (ej: backups, reportes, limpieza)
> - **Manejo** de timezones
> - **Logging** de ejecución
> - **Persistencia** de registros
> - **Prevención** de ejecuciones concurrentes (lock)
> - **Testing** de cron jobs
> - **Configuración** en producción”

---

## 18. Streaming de datos

> **“Implementa un sistema de streaming en Node.js con:**
> - **Readable, Writable y Transform** streams
> - **Procesamiento** de archivos grandes (CSV, JSON)
> - **Streaming** de respuestas HTTP
> - **Uploads** de archivos con multipart
> - **Event Emitters** para progreso
> - **Backpressure** handling
> - **Pipeline** para encadenar streams
> - **Manejo** de errores en streams”

---

## 19. Integración con servicios cloud

> **“Integra servicios cloud en Node.js con:**
> - **AWS SDK:** S3 (storage), SES (email), SQS (colas), Lambda
> - **Google Cloud:** Storage, Pub/Sub, Cloud Functions
> - **Azure:** Blob Storage, Service Bus
> - **Configuración** de credenciales seguras
> - **Retry y backoff** para llamadas API
> - **Rate limiting** para APIs externas
> - **Manejo** de errores de servicios cloud
> - **Caching** de respuestas”

---

## 20. CI/CD para Node.js

> **“Configura un pipeline CI/CD para Node.js con:**
> - **GitHub Actions** o **GitLab CI**
> - **Instalación** de dependencias
> - **Linting** y type checking
> - **Pruebas** unitarias y de integración
> - **Cobertura** de código
> - **Build** de la aplicación
> - **Docker build** y push
> - **Deployment** a [AWS / Heroku / Vercel / DigitalOcean]
> - **Notificaciones** en caso de fallo
> - **Rollback** automático”

---

## 21. Migración de JavaScript a TypeScript

> **“Genera una estrategia para migrar un proyecto Node.js de JavaScript a TypeScript incluyendo:**
> - **Configuración** de TypeScript (tsconfig.json)
> - **Dependencias** necesarias
> - **Migración gradual** (archivo por archivo)
> - **Archivos de declaración** para módulos sin tipos
> - **Configuración** de ESLint/Prettier para TS
> - **Scripts** de build y desarrollo
> - **Manejo** de import/export (CommonJS vs ESM)
> - **Estrategia** para archivos .js existentes”

---

## 22. Optimización de build

> **“Optimiza el build de una aplicación Node.js con:**
> - **esbuild** o **swc** para transpilación rápida
> - **Bundling** para reducir tamaño
> - **Tree shaking** de dependencias
> - **Minificación** de código
> - **Source maps** para producción
> - **Separación** de vendor chunks
> - **Cache** de dependencias en CI
> - **Análisis** de bundle (depcheck, bundle-buddy)”

---

## 23. Node.js + Serverless

> **“Convierte una API Node.js a arquitectura serverless con:**
> - **AWS Lambda** o **Google Cloud Functions**
> - **Serverless Framework** o **AWS SAM**
> - **Cold start** optimización
> - **Conexión** a DB con pooling
> - **Manejo** de variables de entorno
> - **Testing local** con serverless-offline
> - **Monitoring** con CloudWatch
> - **Costos** y limitaciones”