# Exponer el backend desde WSL2 (Windows) con DuckDNS + Nginx + HTTPS

Dominio objetivo: **api.buildwiselabs.duckdns.org** → backend en `:3000`.

WSL2 corre en una red NAT interna. El camino completo del tráfico es:

```
Internet → Router (80/443) → Windows (portproxy) → WSL2 (Nginx) → backend :3000
```

---

## Parte A — Dentro de WSL (Ubuntu)

Abre Ubuntu (WSL) y ejecuta:

```bash
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx

# Copia el backend a WSL (mas rapido que correr desde /mnt)
cp -r /mnt/e/PYME/backend ~/synclabs-backend
cd ~/synclabs-backend
npm install
cp .env.example .env   # edita JWT_SECRET

# Manten el backend vivo con PM2
sudo npm install -g pm2
pm2 start server.js --name synclabs-backend
pm2 startup && pm2 save
```

### DuckDNS (actualizador de IP)

```bash
mkdir -p ~/duckdns
cp /mnt/e/PYME/deploy/duck.sh ~/duckdns/duck.sh   # ya tiene el sub; pon tu TOKEN
chmod 700 ~/duckdns/duck.sh
~/duckdns/duck.sh && cat ~/duckdns/duck.log        # debe decir: OK

sudo service cron start
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -
```

### Nginx

```bash
sudo cp /mnt/e/PYME/deploy/api.conf /etc/nginx/sites-available/api
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo service nginx restart
```

Anota la IP de WSL (la necesitas en la Parte B):

```bash
ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'
```

---

## Parte B — En Windows (PowerShell como Administrador)

Redirige los puertos de Windows hacia WSL. Cambia `WSL_IP` por la IP de arriba:

```bash
netsh interface portproxy add v4tov4 listenport=80  listenaddress=0.0.0.0 connectport=80  connectaddress=WSL_IP
netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=443 connectaddress=WSL_IP
```

Abre el firewall de Windows:

```bash
New-NetFirewallRule -DisplayName "WSL HTTP"  -Direction Inbound -LocalPort 80  -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "WSL HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

> La IP de WSL cambia al reiniciar. Para no repetir esto a mano, guarda este
> script y ejecutalo tras cada reinicio (o con el Programador de tareas al
> iniciar sesion):
>
> ```powershell
> $wsl = (wsl hostname -I).Trim().Split(" ")[0]
> netsh interface portproxy reset
> netsh interface portproxy add v4tov4 listenport=80  connectport=80  connectaddress=$wsl
> netsh interface portproxy add v4tov4 listenport=443 connectport=443 connectaddress=$wsl
> ```

---

## Parte C — Router

Redirige (port forwarding) **80 TCP** y **443 TCP** hacia la IP local de esta PC
Windows (no la de WSL).

---

## Parte D — HTTPS (dentro de WSL, ya con lo anterior funcionando)

```bash
sudo certbot --nginx -d api.buildwiselabs.duckdns.org
sudo certbot renew --dry-run
```

Verifica desde fuera (datos moviles, no wifi de casa):

```bash
curl -I https://api.buildwiselabs.duckdns.org
```

---

## Si el puerto 80 no llega desde internet

Puede ser **CGNAT** de tu proveedor (muy comun en fibra). Comprueba: si tu IP
publica en https://whatismyipaddress.com NO coincide con la IP WAN de tu router,
hay CGNAT y el port forwarding no funcionara. En ese caso, la alternativa es un
tunel (Cloudflare Tunnel o Tailscale) que no necesita abrir puertos — pidelo y
te lo preparo.
