# Exponer el backend con DuckDNS + Nginx + HTTPS

Guía para publicar el **backend Node/API** (puerto **3000**) en internet desde un
**servidor Linux en casa**, con dominio `api.buildwiselabs.duckdns.org` y HTTPS gratis.

> Reemplaza en todos lados:
> - `buildwiselabs` → tu subdominio de DuckDNS (sin `.duckdns.org`)
> - `TU_TOKEN` → el token de tu panel en duckdns.org
>
> Los comandos se ejecutan en el **servidor Linux** (Ubuntu 22.04 / Debian 11),
> no en Windows.

---

## 0. Router (solo servidor en casa)

En tu router, redirige (port forwarding) hacia la IP local del servidor:

- Puerto **80 TCP** → servidor
- Puerto **443 TCP** → servidor

Sin esto, nada será accesible desde internet.

---

## 1. DuckDNS (IP dinámica)

En [duckdns.org](https://www.duckdns.org): inicia sesión, crea `buildwiselabs`, copia el token.

```bash
mkdir -p ~/duckdns
cp duck.sh ~/duckdns/duck.sh
# edita ~/duckdns/duck.sh y pon buildwiselabs y TU_TOKEN
chmod 700 ~/duckdns/duck.sh
~/duckdns/duck.sh && cat ~/duckdns/duck.log   # debe decir: OK
```

Actualización automática cada 5 min:

```bash
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -
```

---

## 2. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

El puerto 3000 NO se abre: solo Nginx habla con el backend por `127.0.0.1`.

---

## 3. Nginx + reverse proxy

```bash
sudo apt update && sudo apt install -y nginx
sudo cp api.conf /etc/nginx/sites-available/api
# edita el archivo y pon buildwiselabs
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.buildwiselabs.duckdns.org
sudo certbot renew --dry-run
```

Certbot edita el sitio para servir HTTPS y redirigir HTTP→HTTPS, y deja la
renovación automática.

---

## 5. Backend siempre encendido (recomendado)

Para que el backend arranque solo y se reinicie si falla, usa PM2:

```bash
sudo npm install -g pm2
cd /ruta/al/backend
pm2 start server.js --name backend
pm2 startup && pm2 save
```

---

## 6. Verificar

```bash
curl -I https://api.buildwiselabs.duckdns.org
```

Debe responder `HTTP/2 200` con certificado válido.

---

## Notas

- Si tienes un dominio propio (`nsp.com`), añade un registro **CNAME**
  `api.nsp.com → api.buildwiselabs.duckdns.org` y emite el cert también para ese nombre.
- La app **Sync Labs** vive en Vercel y ya tiene su propio HTTPS; esto es solo
  para el backend/servicios auto-alojados.
