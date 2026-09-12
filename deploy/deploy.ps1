# Deploy script — BuildWise Labs
# Sube cada app configurada en $APPS via SCP/SSH nativo de Windows (OpenSSH).
#
# Uso:
#   .\deploy.ps1 -App buildwiselabs
#   .\deploy.ps1 -App bot-pedregoza
#   .\deploy.ps1 -ListApps

param(
    [string]$App = "buildwiselabs",
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$SkipExe,
    [switch]$Help,
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$ListApps
)

# ____ Configuracion de cada app ________
# HasFrontend = $true  -> ademas del backend, se compila y sube un frontend (Expo).
# HasFrontend = $false -> solo hay backend (ej. agro-bot-node ya sirve sus paginas
#                          directo desde src/public, no necesita build aparte).
$APPS = @{

    "buildwiselabs" = @{
        DOMAIN         = "buildwiselabs.net"
        SFTP_HOST      = "82.198.232.179"
        SFTP_PORT      = 65002
        SFTP_USER      = "u695228895"
        REMOTE_NODE    = "/home/u695228895/domains/buildwiselabs.net/hbuilds/current/nodejs"
        REMOTE_PUBLIC  = "/home/u695228895/domains/buildwiselabs.net/hbuilds/current/nodejs/public"
        REMOTE_RESTART = "/home/u695228895/domains/buildwiselabs.net/hbuilds/current/nodejs/tmp/restart.txt"
        HasFrontend    = $true
        EXPO_DIR       = "E:\PYME\expo"
        DIST_DIR       = "E:\PYME\expo\dist"
        BACKEND_DIR    = "E:\PYME\backend"
        GUI_EXE        = "E:\PYME\GUI\dist\VisorReportesCampo.exe"
    }

    "bot-pedregoza" = @{
        # TODO: cambia DOMAIN y REMOTE_NODE por lo que te de el hPanel de Hostinger al
        # crear el subdominio + "Aplicacion Node.js" para este bot (Hostinger >
        # Sitios web > Administrar > Aplicaciones Node.js > Crear aplicacion). El panel
        # te va a asignar una carpeta remota propia -- pega esa ruta aqui en REMOTE_NODE.
        # REMOTE_PUBLIC/REMOTE_RESTART no hace falta tocarlos, se arman solos.
        DOMAIN         = ""
        SFTP_HOST      = "82.198.232.179"
        SFTP_PORT      = 65002
        SFTP_USER      = "u695228895"
        REMOTE_NODE    = "CAMBIA_ESTO_ruta_que_te_dio_hostinger"
        REMOTE_PUBLIC  = "CAMBIA_ESTO_ruta_que_te_dio_hostinger/public"
        REMOTE_RESTART = "CAMBIA_ESTO_ruta_que_te_dio_hostinger/tmp/restart.txt"
        HasFrontend    = $false
        BACKEND_DIR    = "E:\PYME\bot\agro-bot-node\agro-bot-node"
    }
}

function Show-Apps {
    Write-Host "`nAplicaciones configuradas:" -ForegroundColor Cyan
    foreach ($key in $APPS.Keys) {
        $domain = $APPS[$key].DOMAIN
        Write-Host "  - $key (dominio: $domain)" -ForegroundColor Green
    }
    Write-Host "`nEjemplo de uso: .\deploy.ps1 -App bot-pedregoza" -ForegroundColor Yellow
}

if ($ListApps) {
    Show-Apps
    exit 0
}

if (-not $APPS.ContainsKey($App)) {
    Write-Host "ERROR: la app '$App' no esta configurada en `$APPS." -ForegroundColor Red
    Show-Apps
    exit 1
}
$cfg = $APPS[$App]

if ($cfg.REMOTE_NODE -like "CAMBIA_ESTO*") {
    Write-Host "ERROR: '$App' todavia tiene datos de ejemplo sin llenar (DOMAIN/REMOTE_NODE)." -ForegroundColor Red
    Write-Host "Edita el bloque de '$App' en deploy.ps1 con los datos reales del hPanel de Hostinger antes de desplegar." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== Desplegando '$App' ($($cfg.DOMAIN)) ===" -ForegroundColor Magenta

# Busca ssh/scp considerando redireccion de 32-bit (Sysnative) y 64-bit (System32)
$sshCandidates = @(
    "$env:SystemRoot\Sysnative\OpenSSH\ssh.exe",
    "$env:SystemRoot\System32\OpenSSH\ssh.exe"
)
$scpCandidates = @(
    "$env:SystemRoot\Sysnative\OpenSSH\scp.exe",
    "$env:SystemRoot\System32\OpenSSH\scp.exe"
)
$SSH = $sshCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
$SCP = $scpCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $SSH -or -not $SCP) {
    Write-Host "ERROR: OpenSSH no encontrado." -ForegroundColor Red
    Write-Host "Activa en: Configuracion > Apps > Caracteristicas opcionales > Cliente OpenSSH" -ForegroundColor Yellow
    exit 1
}
Write-Host "  SSH: $SSH" -ForegroundColor DarkGray

# ── 0. Verificar conectividad ─────────────────────────────────────────────────
Write-Host "`n[0/3] Verificando conexion a $($cfg.SFTP_HOST):$($cfg.SFTP_PORT)..." -ForegroundColor Cyan
$tcp = New-Object System.Net.Sockets.TcpClient
try {
    $tcp.Connect($cfg.SFTP_HOST, $cfg.SFTP_PORT)
    Write-Host "  Puerto $($cfg.SFTP_PORT) accesible." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: No se puede conectar. $_" -ForegroundColor Red; exit 1
} finally { $tcp.Close() }

# ── 1. Build frontend (solo si la app tiene uno) ────────────────────────────────
if ($cfg.HasFrontend -and -not $BackendOnly) {
    Write-Host "`n[1/3] Construyendo frontend..." -ForegroundColor Cyan
    Push-Location $cfg.EXPO_DIR
    npx expo export --platform web
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en el build." -ForegroundColor Red; exit 1 }
    Pop-Location
    Write-Host "Build listo en $($cfg.DIST_DIR)" -ForegroundColor Green
}

# ── 2. Subir frontend + .exe via SCP (solo si la app tiene uno) ─────────────────
if ($cfg.HasFrontend -and -not $BackendOnly) {
    Write-Host "`n[2/3] Subiendo frontend a Hostinger (se pedira contrasena)..." -ForegroundColor Cyan

    if (-not $SkipExe -and $cfg.GUI_EXE -and (Test-Path $cfg.GUI_EXE)) {
        $localDownloads = "$($cfg.DIST_DIR)\downloads"
        New-Item -ItemType Directory -Force -Path $localDownloads | Out-Null
        Copy-Item $cfg.GUI_EXE "$localDownloads\VisorReportesCampo.exe" -Force
        Write-Host "  .exe copiado a dist/downloads/" -ForegroundColor DarkCyan
    }

    & $SSH -p $cfg.SFTP_PORT "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST)" "mkdir -p $($cfg.REMOTE_PUBLIC)"

    Get-ChildItem $cfg.DIST_DIR | ForEach-Object {
        if ($_.PSIsContainer) {
            Write-Host "  Subiendo carpeta: $($_.Name)" -ForegroundColor DarkGray
            & $SCP -r -P $cfg.SFTP_PORT $_.FullName "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_PUBLIC)/"
        } else {
            Write-Host "  Subiendo: $($_.Name)" -ForegroundColor DarkGray
            & $SCP -P $cfg.SFTP_PORT $_.FullName "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_PUBLIC)/"
        }
    }
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR subiendo frontend." -ForegroundColor Red; exit 1 }
    Write-Host "Frontend subido." -ForegroundColor Green
} elseif (-not $BackendOnly) {
    Write-Host "`n[1-2/3] '$App' no tiene frontend propio -- se salta el build/subida (sirve sus paginas directo desde el backend)." -ForegroundColor DarkGray
}

# ── 3. Subir backend + restart via SCP/SSH ────────────────────────────────────
if (-not $FrontendOnly) {
    Write-Host "`n[3/3] Subiendo backend y reiniciando..." -ForegroundColor Cyan

    # Excluye lo que nunca debe salir de tu maquina: dependencias, git, .env con
    # secretos, zips/carpetas que deja el sync, y la llave de la cuenta de servicio de
    # Google (el backend ya toma esas credenciales del .env, no de este archivo).
    $items = Get-ChildItem $cfg.BACKEND_DIR -Exclude "node_modules", ".git", "dist", "public", ".env", "*.zip", "_to_delete", "agro-bot-sheets-*.json"
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            & $SCP -r -P $cfg.SFTP_PORT "$($item.FullName)" "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_NODE)/"
        } else {
            & $SCP -P $cfg.SFTP_PORT "$($item.FullName)" "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_NODE)/"
        }
    }

    & $SSH -p $cfg.SFTP_PORT "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST)" "touch $($cfg.REMOTE_RESTART)"
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR reiniciando backend." -ForegroundColor Red; exit 1 }
    Write-Host "Backend subido y Passenger reiniciado." -ForegroundColor Green
    Write-Host "  Si agregaste dependencias nuevas (package.json cambio, ej. socket.io), entra al hPanel > esa Aplicacion Node.js > 'Ejecutar NPM Install' despues de este deploy." -ForegroundColor Yellow
}

Write-Host "`nDeploy completado. https://$($cfg.DOMAIN)" -ForegroundColor Green
if ($cfg.HasFrontend -and -not $BackendOnly -and -not $SkipExe -and $cfg.GUI_EXE -and (Test-Path $cfg.GUI_EXE)) {
    Write-Host "  .exe en: https://$($cfg.DOMAIN)/downloads/VisorReportesCampo.exe" -ForegroundColor DarkCyan
}
