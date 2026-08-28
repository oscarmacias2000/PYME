# Exponer el backend desde Windows con DuckDNS + Caddy + HTTPS

El backend corre en `localhost:3000`. Caddy actua como reverse proxy y
consigue el certificado HTTPS automaticamente. DuckDNS mantiene el dominio
apuntando a tu IP publica.

Flujo del trafico:
```
Internet → Router (80/443) → Windows (Caddy) → backend :3000
```

---

## Paso 1 — DuckDNS: actualiza tu IP

Abre PowerShell y ejecuta una vez para probar:

```powershell
powershell -ExecutionPolicy Bypass -File "E:\PYME\deploy\duck.ps1"
```

Debe mostrar: `OK`

Luego ve a [duckdns.org](https://www.duckdns.org) y confirma que
`buildwiselabs.duckdns.org` muestra tu IP publica actual.

### Automatizar con Task Scheduler (cada 5 min)

```powershell
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
             -Argument '-WindowStyle Hidden -ExecutionPolicy Bypass -File "E:\PYME\deploy\duck.ps1"'
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -Once -At (Get-Date)
Register-ScheduledTask -TaskName "DuckDNS-BuildWise" -Action $action -Trigger $trigger -RunLevel Highest -Force
```

---

## Paso 2 — Router: port forwarding

En el panel de tu router redirecciona hacia la IP local de este PC:

| Puerto externo | Puerto interno | Protocolo |
|---|---|---|
| 80 | 80 | TCP |
| 443 | 443 | TCP |

Tu IP local la ves con: `ipconfig` (busca "Direccion IPv4", ej: 192.168.1.X).

---

## Paso 3 — Caddy (reverse proxy con HTTPS automatico)

Descarga Caddy para Windows desde https://caddyserver.com/download
(elige Windows amd64, descarga el .exe).

Copia `caddy.exe` a `E:\PYME\deploy\` y ejecuta:

```powershell
cd E:\PYME\deploy
.\caddy.exe run --config Caddyfile
```

Caddy pide el certificado a Let's Encrypt la primera vez (necesita que
el dominio ya apunte a tu IP y que los puertos 80/443 esten abiertos).

### Para que Caddy arranque solo al iniciar Windows

```powershell
.\caddy.exe install-service --config "E:\PYME\deploy\Caddyfile"
```

---

## Paso 4 — Verifica

Desde datos moviles (no wifi de casa):

```
curl -I https://api.buildwiselabs.duckdns.org
```

Debe responder `HTTP/2 200`.

---

## Notas

- El puerto **3000** NO se abre en el router; solo Caddy habla con el backend.
- Si tu proveedor de internet usa CGNAT (la IP en whatismyipaddress.com
  no coincide con la WAN del router), el port forwarding no funciona.
  Alternativa sin abrir puertos: **Cloudflare Tunnel** (gratuito).
- Una vez que el backend tenga HTTPS, pon en Vercel la variable:
  `EXPO_PUBLIC_API_URL = https://api.buildwiselabs.duckdns.org`
