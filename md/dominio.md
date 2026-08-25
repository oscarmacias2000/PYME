# 🌐 Prompt para Claude: Configurar Dominio Personalizado con Nginx + DuckDNS/deSEC

> **"Actúa como un experto en DevOps y administración de servidores Linux. Necesito configurar un dominio personalizado para mi servidor usando Nginx como proxy inverso y un servicio de DNS dinámico (DuckDNS o deSEC).**

---

## 📋 Requisitos Generales

### Objetivo
Configurar un dominio personalizado (ej: `nsp.com` o `nsp.com`) que apunte a mi servidor VPS/doméstico, con Nginx manejando el tráfico y SSL/HTTPS con Let's Encrypt.

### Servicios a elegir

#### Opción A: DuckDNS (Gratuito y simple)
- **Dominio:** `tusubdominio.duckdns.org`
- **Actualización:** Script cada 5 minutos via cron
- **Ventajas:** Sencillo, ampliamente usado, buena documentación


## 🖥️ Entorno del Servidor

### Especificaciones
- **Sistema Operativo:** Ubuntu 22.04 LTS / Debian 11
- **Arquitectura:** x86_64 / ARM
- **IP Pública:** [Dinámica / Estática]
- **Puertos abiertos:** 80 (HTTP), 443 (HTTPS)
- **Firewall:** UFW / iptables configurado

### Aplicaciones a exponer
- **Aplicación 1:** [Node.js / React / API] en puerto [3000]
- **Aplicación 2:** [Next.js / Python / PHP] en puerto [3001]
- **Aplicación 3:** [Base de datos / Adminer / phpMyAdmin] en puerto [8080]

---

## 🔧 Configuración Técnica Requerida

### 1. Registro y configuración del dominio

#### DuckDNS
```bash
# Crear subdominio en duckdns.org
# Registrar IP actual
# Token de actualización