# 🏢 Prompts para Integración con eMex (Mangos)

Colección de prompts para integrar el ERP eMex con APIs, bases de datos y sistemas externos.

---

## 📦 Integración con API REST

### 1. API REST básica para eMex

> **"Actúa como un experto en integración de sistemas ERP. Necesito crear una API REST para conectar con eMex de Mangos.**
> 
> **Requisitos:**
> - **Base de datos:** Firebird
> - **Lenguaje:** [Node.js / Python]
> - **Endpoints necesarios:**
>   - GET /api/clientes - Listar todos los clientes
>   - GET /api/clientes/:id - Obtener cliente por ID
>   - GET /api/productos - Listar productos con inventario
>   - GET /api/productos/:codigo - Buscar producto por código
>   - GET /api/ventas/:fecha - Ventas por fecha
>   - POST /api/facturar - Crear factura desde pedido
>   - GET /api/inventario/:producto - Consultar inventario
> 
> **Incluye:**
> - Conexión a Firebird con pool de conexiones
> - Manejo de errores completo
> - Logging de todas las operaciones
> - Variables de entorno
> - Rate limiting (100 req/min)
> - Autenticación con JWT o API Key
> - Documentación Swagger/OpenAPI
> - Ejemplos de uso en el readme"

---

### 2. API para facturación CFDI 4.0

> **"Implementa una API para facturación automática con eMex:**
> 
> **Funcionalidades:**
> - Crear factura desde pedido
> - Cancelar factura
> - Consultar estatus de factura
> - Descargar PDF/XML de factura
> - Timbrar automáticamente
> - Enviar factura por email
> 
> **Validaciones:**
> - RFC válido
> - Uso CFDI (G01, G02, G03, etc.)
> - Régimen fiscal del cliente
> - Código postal correcto
> - Productos con SAT codes
> 
> **Incluye:**
> - Validación de datos antes de facturar
> - Colas para procesamiento asíncrono
> - Notificaciones de éxito/error
> - Reintentos automáticos"