## 📦 Nginx

### 1. Configuración básica de Nginx

> **"Actúa como un experto en Nginx. Genera una configuración básica de Nginx para:**
> - **Tipo de aplicación:** [Node.js / React / PHP / Python / Static]
> - **Puerto:** [3000 / 8080 / 80]
> - **Dominio:** [ejemplo.com]
> - **SSL/HTTPS:** [Sí / No]
> - **Estructura de archivos:** [ruta del proyecto]
> 
> Incluye: server block, root directory, index, error pages y logging básico."

**Ejemplo:**
> "Actúa como un experto en Nginx. Genera una configuración básica de Nginx para una **aplicación React** en el puerto **3000** con dominio **miapp.com** y **SSL habilitado**. Incluye server block, root directory, index, error pages y logging básico."

---

### 2. Nginx como proxy inverso

> **"Configura Nginx como proxy inverso para:**
> - **Backend:** [Node.js / Express / API REST] en puerto [3000]
> - **Rutas:** [API / /api/*]
> - **Headers:** [X-Forwarded-For, X-Real-IP, Host]
> - **WebSockets:** [Sí / No]
> - **Timeout:** [60s]
> - **Buffering:** [activado / desactivado]
> 
> Incluye configuración de proxy_pass, proxy_set_header, proxy_http_version y upgrade para WebSockets."

---

### 3. Load Balancing con Nginx

> **"Configura un load balancer con Nginx para:**
> - **Número de servidores:** [3]
> - **Estrategia:** [round-robin / least-connected / ip-hash]
> - **Puertos:** [3001, 3002, 3003]
> - **Health checks:** [Sí / No]
> - **Sticky sessions:** [Sí / No]
> 
> Incluye upstream block, server directives, health checks y configuración de retry."

---

### 4. SSL/HTTPS con Let's Encrypt

> **"Configura SSL/HTTPS en Nginx usando Let's Encrypt y Certbot:**
> - **Dominios:** [ejemplo.com, www.ejemplo.com]
> - **Redirección HTTP→HTTPS:** [Sí / No]
> - **Cipher suite:** [recomendada / personalizada]
> - **HSTS:** [Sí / No]
> 
> Incluye: configuración de certificados, redirección 301, SSL ciphers, OCSP stapling y renovación automática."

---

### 5. Caching y compresión

> **"Optimiza Nginx con caching y compresión para:**
> - **Assets estáticos:** [images, CSS, JS, fonts]
> - **Compresión:** [gzip / brotli]
> - **Cacheo:** [1 año / 1 mes / 1 día]
> - **Microcaching:** [Sí / No]
> 
> Incluye: configuración de gzip/brotli, expires headers, etag, cache-control, y microcaching para API."

---

### 6. Rate Limiting y seguridad

> **"Implementa seguridad en Nginx con:**
> - **Rate limiting:** [10 req/seg / 100 req/min]
> - **Limitación por IP:** [Sí / No]
> - **Whitelist/Blacklist:** [IPs específicas]
> - **Protección DDoS básica:** [Sí / No]
> - **Máximo de conexiones:** [100 por IP]
> 
> Incluye: limit_req_zone, limit_req, limit_conn_zone, allow/deny, y configurations de seguridad adicionales."

---

### 7. Nginx + React/Vue/SPA

> **"Configura Nginx para servir una SPA (React/Vue) con:**
> - **Routing:** [BrowserRouter / History mode]
> - **Assets estáticos:** [carpeta build/dist]
> - **API proxy:** [a backend en puerto 3000]
> - **Fallback:** [index.html para 404]
> - **Cacheo:** [assets con hash, HTML sin cache]
> 
> Incluye: try_files, location blocks, alias, rewrites y configuración de headers."

---

### 8. Nginx + Node.js (PM2)

> **"Configura Nginx con Node.js usando PM2:**
> - **Aplicación:** [API REST / Web App]
> - **Puerto:** [3000]
> - **PM2:** [cluster mode con [X] instancias]
> - **Health check:** [/health]
> - **Logs:** [acceso y errores]
> 
> Incluye: upstream con socket, proxy_pass, health checks, logging y configuración de PM2 para Nginx."

---

### 9. Nginx + PHP-FPM

> **"Configura Nginx con PHP-FPM para:**
> - **Versión PHP:** [8.0 / 8.1 / 8.2]
> - **Framework:** [Laravel / WordPress / Symfony]
> - **Pool settings:** [dynamic / static]
> - **Optimización:** [memoria, procesos]
> 
> Incluye: location ~ \.php$, fastcgi_pass, fastcgi_params, y configuración de pool de PHP-FPM."

---

### 10. Nginx + Docker

> **"Genera un docker-compose con Nginx para:**
> - **Servicios:** [Node.js / React / PHP / MySQL]
> - **Volumes:** [para código fuente y logs]
> - **Network:** [bridge / custom]
> - **Variables de entorno:** [port, domain]
> 
> Incluye: Dockerfile de Nginx, nginx.conf, docker-compose.yml y configuración de volumes."

---

### 11. Nginx con WebSockets

> **"Configura Nginx para soportar WebSockets con:**
> - **Backend:** [Socket.io / WS / SockJS]
> - **Ruta:** [/socket.io / /ws]
> - **Timeout:** [60s / 300s]
> - **Headers:** [Upgrade, Connection]
> 
> Incluye: proxy_http_version 1.1, upgrade headers, proxy_set_header y configuración de buffering."

---

### 12. Nginx + Let's Encrypt (Docker)

> **"Configura Nginx en Docker con Let's Encrypt usando:**
> - **Certbot:** [en contenedor separado]
> - **Renovación automática:** [cron job / systemd]
> - **Dominios:** [múltiples subdominios]
> - **Estrategia:** [certbot certonly --webroot]
> 
> Incluye: docker-compose con certbot, configuración de webroot, renovación automática y reload de Nginx."

---

### 13. Nginx + CDN (Cloudflare)

> **"Configura Nginx para trabajar con Cloudflare:**
> - **IPs reales:** [cloudflare-ip-ranges]
> - **Protocolo:** [HTTP/2 / HTTP/3 (QUIC)]
> - **Cacheo:** [Sí / No]
> - **SSL:** [Full (strict) / Flexible]
> - **Origen Pull:** [Sí / No]
> 
> Incluye: real_ip_header, set_real_ip_from, http2, cloudflare cache headers y configuración SSL."

---

### 14. Logging y monitoreo

> **"Configura logging y monitoreo en Nginx con:**
> - **Formato de logs:** [JSON / combined]
> - **Rotación:** [logrotate]
> - **Monitoreo:** [Prometheus / Grafana]
> - **Métricas:** [request count, latency, errors]
> 
> Incluye: access_log con formato JSON, error_log, logrotate config, y exporters para métricas."

---

### 15. Migrar de Apache a Nginx

> **"Genera una estrategia de migración de Apache a Nginx:**
> - **Configuración Apache:** [.htaccess con mod_rewrite]
> - **Reescrituras:** [convertir .htaccess a Nginx]
> - **Módulos:** [mod_php, mod_wsgi, mod_proxy]
> - **Performance:** [diferencias y optimización]
> 
> Incluye: conversión de reglas de reescritura, equivalencias de módulos, y comparativa de performance."

---

### 16. Nginx + gRPC

> **"Configura Nginx como proxy para gRPC:**
> - **Backend:** [gRPC en puerto 50051]
> - **SSL:** [Sí, con HTTP/2]
> - **Headers:** [grpc-*]
> 
> Incluye: grpc_pass, http2, ssl y configuración de health checks."

---

### 17. Nginx en Kubernetes (Ingress)

> **"Configura Nginx como Ingress Controller en Kubernetes:**
> - **Aplicaciones:** [múltiples servicios]
> - **SSL/TLS:** [con cert-manager]
> - **Rutas:** [basadas en host y path]
> - **Annotations:** [timeouts, retries, rate limits]
> 
> Incluye: Ingress manifest, configMap, annotations y ejemplo de deployment."

---

### 18. Optimización de Nginx

> **"Optimiza Nginx para alto tráfico:**
> - **Worker processes:** [auto / número de CPUs]
> - **Worker connections:** [1024 / 4096]
> - **Keepalive:** [65 / 300]
> - **Buffer sizes:** [optimizados]
> - **Gzip:** [optimizado]
> 
> Incluye: eventos de worker, optimización de buffers, timeout, y tuning general."

---

### 19. Nginx + Next.js

> **"Configura Nginx para Next.js:**
> - **Modo:** [standalone / custom server]
> - **Puerto:** [3000]
> - **Assets:** [/_next/* estáticos]
> - **Revalidación:** [ISR / on-demand]
> - **Cacheo:** [Sí / No]
> 
> Incluye: location blocks para _next, rewrites para API, caching de static assets."

---

### 20. Nginx + WordPress (alta performance)

> **"Configura Nginx para WordPress de alta performance:**
> - **Cacheo:** [FastCGI cache]
> - **Permalinks:** [personalizados]
> - **WAF:** [modsecurity / fail2ban]
> - **Redis:** [para object cache]
> 
> Incluye: fastcgi_cache, rewrite rules, wp-config optimizado y seguridad."
