# Deploy script — BuildWise Labs
# Sube cada app configurada en $APPS via SCP/SSH nativo de Windows (OpenSSH).
#
# Uso:
#   .\deploy.ps1 -App buildwiselabs
#   .\deploy.ps1 -App bot-pedregoza
#   .\deploy.ps1 -App buildwiselabs -Zip       # todo en un solo .zip (2 contrasenas)
#   .\deploy.ps1 -App buildwiselabs -ZipOnly   # solo arma deploy\out\<app>.zip para subirlo a mano
#   .\deploy.ps1 -App buildwiselabs -ZipOnly -SkipBuild   # reutiliza expo\dist sin recompilar
#   .\deploy.ps1 -ListApps

param(
    [string]$App = "buildwiselabs",
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$SkipExe,
    [switch]$SkipBuild,
    [switch]$Zip,
    [switch]$ZipOnly,
    [switch]$Help,
    [switch]$Verbose,
    [switch]$Debug,
    [switch]$ListApps
)
if ($ZipOnly) { $Zip = $true }

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
        DOMAIN         = "comanpackagrobot.com"
        SFTP_HOST      = "82.198.232.179"
        SFTP_PORT      = 65002
        SFTP_USER      = "u695228895"
        REMOTE_NODE    = "/home/u695228895/domains/comanpackagrobot.com/public_html"
        REMOTE_PUBLIC  = "/home/u695228895/domains/comanpackagrobot.com/public_html/public"
        REMOTE_RESTART = "/home/u695228895/domains/comanpackagrobot.com/public_html/tmp/restart.txt"
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

# Lo que nunca debe salir de tu maquina (aplica al scp y al zip): dependencias, git,
# .env con secretos, zips/carpetas que deja el sync y las llaves de Google. "data" es
# la base JSON del backend (usuarios y mensajes): la de produccion vive en el servidor
# y src/db.js la crea si no existe, subir la local la pisaria. Ojo: -Exclude solo
# compara los nombres del primer nivel de BACKEND_DIR, por eso las llaves que viven
# dentro de Descargas/ se excluyen por el nombre de la carpeta.
$BACKEND_EXCLUDE = @(
    "node_modules", ".git", "dist", "public", ".env", "*.zip", "_to_delete", "data",
    "Descargas", "agro-bot-sheets-*.json", "chatbot-*.json", "*-credentials.json", "service-account*.json",
    "agregar-a-env.txt"
)

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
if (-not $ZipOnly -and (-not $SSH -or -not $SCP)) {
    Write-Host "ERROR: OpenSSH no encontrado." -ForegroundColor Red
    Write-Host "Activa en: Configuracion > Apps > Caracteristicas opcionales > Cliente OpenSSH" -ForegroundColor Yellow
    exit 1
}
Write-Host "  SSH: $SSH" -ForegroundColor DarkGray

# NOTA: se probo agregar ControlMaster/ControlPersist aqui para reutilizar una sola
# conexion SSH en todo el deploy, pero el OpenSSH de Windows de esta maquina no soporta
# bien el socket de control (tira "getsockname failed: Not a socket" y corta la conexion
# a medio subir el backend) -- se quito. La solucion que SI funciona y se quedo abajo es
# juntar todos los archivos/carpetas en un solo "scp" por paso (ver mas abajo), en vez de
# uno por carpeta: eso ya baja de "una contrasena por carpeta" a una sola por paso
# (backend, y otra para el reinicio).

# ── 0. Verificar conectividad ─────────────────────────────────────────────────
if (-not $ZipOnly) {
    Write-Host "`n[0/3] Verificando conexion a $($cfg.SFTP_HOST):$($cfg.SFTP_PORT)..." -ForegroundColor Cyan
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect($cfg.SFTP_HOST, $cfg.SFTP_PORT)
        Write-Host "  Puerto $($cfg.SFTP_PORT) accesible." -ForegroundColor Green
    } catch {
        Write-Host "  ERROR: No se puede conectar. $_" -ForegroundColor Red; exit 1
    } finally { $tcp.Close() }
}

# ── 1. Build frontend (solo si la app tiene uno) ────────────────────────────────
if ($cfg.HasFrontend -and -not $BackendOnly -and $SkipBuild) {
    if (-not (Test-Path "$($cfg.DIST_DIR)\index.html")) {
        Write-Host "ERROR: -SkipBuild pero no hay build previo en $($cfg.DIST_DIR)." -ForegroundColor Red; exit 1
    }
    $builtAt = (Get-Item "$($cfg.DIST_DIR)\index.html").LastWriteTime
    Write-Host "`n[1/3] -SkipBuild: se reutiliza el build existente ($builtAt)." -ForegroundColor DarkGray
} elseif ($cfg.HasFrontend -and -not $BackendOnly) {
    Write-Host "`n[1/3] Construyendo frontend..." -ForegroundColor Cyan
    Push-Location $cfg.EXPO_DIR
    npx expo export --platform web
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en el build." -ForegroundColor Red; exit 1 }
    Pop-Location
    Write-Host "Build listo en $($cfg.DIST_DIR)" -ForegroundColor Green
}

# ── Modo ZIP (-Zip / -ZipOnly) ────────────────────────────────────────────────
# Arma una carpeta temporal con la misma estructura que REMOTE_NODE (backend en la
# raiz + frontend en public/), la comprime en deploy\out\<app>.zip y la sube en un
# solo scp. En el servidor se descomprime encima de lo que ya hay: igual que el scp
# normal, sobrescribe pero no borra archivos viejos.
if ($Zip) {
    # La carpeta temporal va junto al zip (mismo disco que el proyecto) y no en %TEMP%,
    # que vive en C: y ahi se queda sin espacio al copiar el .exe.
    $outDir  = Join-Path $PSScriptRoot "out"
    $stage   = Join-Path $outDir "_stage-$App"
    $zipPath = Join-Path $outDir "$App.zip"

    Write-Host "`n[2/3] Armando $zipPath..." -ForegroundColor Cyan
    if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $outDir, $stage | Out-Null

    if (-not $FrontendOnly) {
        Get-ChildItem $cfg.BACKEND_DIR -Exclude $BACKEND_EXCLUDE | Copy-Item -Destination $stage -Recurse -Force
    }

    if ($cfg.HasFrontend -and -not $BackendOnly) {
        if (-not $cfg.REMOTE_PUBLIC.StartsWith("$($cfg.REMOTE_NODE)/")) {
            Write-Host "ERROR: REMOTE_PUBLIC debe estar dentro de REMOTE_NODE para usar -Zip." -ForegroundColor Red; exit 1
        }
        $publicDir = Join-Path $stage $cfg.REMOTE_PUBLIC.Substring($cfg.REMOTE_NODE.Length + 1)
        New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
        Copy-Item "$($cfg.DIST_DIR)\*" $publicDir -Recurse -Force
        if (-not $SkipExe -and $cfg.GUI_EXE -and (Test-Path $cfg.GUI_EXE)) {
            New-Item -ItemType Directory -Force -Path "$publicDir\downloads" | Out-Null
            Copy-Item $cfg.GUI_EXE "$publicDir\downloads\VisorReportesCampo.exe" -Force
        }
    }

    # tar.exe (viene con Windows 10+) en vez de Compress-Archive: el de PowerShell 5.1
    # guarda las rutas con "\" y al descomprimir en Linux salen archivos llamados
    # "src\auth.js" en lugar de carpetas. tar usa "/" como espera el servidor.
    $TAR = @("$env:SystemRoot\Sysnative\tar.exe", "$env:SystemRoot\System32\tar.exe") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
    if (-not $TAR) { Write-Host "ERROR: tar.exe no encontrado (requiere Windows 10 1803+)." -ForegroundColor Red; exit 1 }
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    $entries = @(Get-ChildItem $stage -Force | ForEach-Object { $_.Name })
    if ($entries.Count -eq 0) { Write-Host "ERROR: no hay nada que empaquetar con esas opciones." -ForegroundColor Red; exit 1 }
    & $TAR -a -c -f $zipPath -C $stage @entries
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR creando el zip." -ForegroundColor Red; exit 1 }
    Remove-Item $stage -Recurse -Force
    $zipMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
    Write-Host "Zip listo: $zipPath ($zipMb MB, $($entries.Count) elemento(s) en la raiz)" -ForegroundColor Green

    if ($ZipOnly) {
        Write-Host "`nNo se subio nada (-ZipOnly). Para subirlo a mano:" -ForegroundColor Yellow
        Write-Host "  1. hPanel > Administrador de archivos > $($cfg.REMOTE_NODE)" -ForegroundColor Yellow
        Write-Host "  2. Sube $App.zip ahi y usa 'Extraer' (sobrescribir)." -ForegroundColor Yellow
        Write-Host "  3. hPanel > Aplicacion Node.js > 'Ejecutar NPM Install' si cambio package.json, y reinicia." -ForegroundColor Yellow
        exit 0
    }

    Write-Host "`n[3/3] Subiendo zip y reiniciando (se pedira contrasena 2 veces)..." -ForegroundColor Cyan
    & $SCP -P $cfg.SFTP_PORT $zipPath "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_NODE)/_deploy.zip"
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR subiendo el zip." -ForegroundColor Red; exit 1 }

    # unzip -o sobrescribe sin preguntar; si el servidor no trae unzip se usa python3.
    $remoteCmd = "cd $($cfg.REMOTE_NODE) && (unzip -oq _deploy.zip || python3 -m zipfile -e _deploy.zip .) && rm -f _deploy.zip && mkdir -p tmp && touch $($cfg.REMOTE_RESTART)"
    & $SSH -p $cfg.SFTP_PORT "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST)" $remoteCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR descomprimiendo/reiniciando en el servidor." -ForegroundColor Red; exit 1 }

    Write-Host "Zip descomprimido y Passenger reiniciado." -ForegroundColor Green
    Write-Host "  Si agregaste dependencias nuevas (package.json cambio, ej. pg), entra al hPanel > esa Aplicacion Node.js > 'Ejecutar NPM Install' despues de este deploy." -ForegroundColor Yellow
    Write-Host "`nDeploy completado. https://$($cfg.DOMAIN)" -ForegroundColor Green
    exit 0
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

    # Un solo scp con todos los elementos de una vez (antes: uno por carpeta/archivo,
    # pidiendo contrasena en cada uno). -r no afecta a los archivos sueltos, solo permite
    # que los que si son carpeta se copien recursivos.
    $frontendItems = Get-ChildItem $cfg.DIST_DIR
    if ($frontendItems.Count -gt 0) {
        Write-Host "  Subiendo $($frontendItems.Count) elemento(s) de $($cfg.DIST_DIR) de una sola vez..." -ForegroundColor DarkGray
        $frontendPaths = $frontendItems | ForEach-Object { $_.FullName }
        & $SCP -r -P $cfg.SFTP_PORT @frontendPaths "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_PUBLIC)/"
    }
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR subiendo frontend." -ForegroundColor Red; exit 1 }
    Write-Host "Frontend subido." -ForegroundColor Green
} elseif (-not $BackendOnly) {
    Write-Host "`n[1-2/3] '$App' no tiene frontend propio -- se salta el build/subida (sirve sus paginas directo desde el backend)." -ForegroundColor DarkGray
}

# ── 3. Subir backend + restart via SCP/SSH ────────────────────────────────────
if (-not $FrontendOnly) {
    Write-Host "`n[3/3] Subiendo backend y reiniciando..." -ForegroundColor Cyan

    # Exclusiones en $BACKEND_EXCLUDE (arriba). El backend toma las credenciales de
    # Google del .env, no de los .json.
    $items = Get-ChildItem $cfg.BACKEND_DIR -Exclude $BACKEND_EXCLUDE
    if ($items.Count -gt 0) {
        Write-Host "  Subiendo $($items.Count) elemento(s) de $($cfg.BACKEND_DIR) de una sola vez..." -ForegroundColor DarkGray
        $itemPaths = $items | ForEach-Object { $_.FullName }
        & $SCP -r -P $cfg.SFTP_PORT @itemPaths "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST):$($cfg.REMOTE_NODE)/"
        if ($LASTEXITCODE -ne 0) { Write-Host "ERROR subiendo backend." -ForegroundColor Red; exit 1 }
    }

    # En una app Node recien creada en hPanel, la carpeta "tmp" no siempre viene creada
    # de antemano -- si el touch se hace directo, truena con "No such file or directory".
    # Se crea primero (mkdir -p no hace nada si ya existe, asi que es seguro para apps
    # viejas como buildwiselabs que ya la tienen) y luego se toca el restart.txt.
    & $SSH -p $cfg.SFTP_PORT "$($cfg.SFTP_USER)@$($cfg.SFTP_HOST)" "mkdir -p $($cfg.REMOTE_NODE)/tmp && touch $($cfg.REMOTE_RESTART)"
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR reiniciando backend." -ForegroundColor Red; exit 1 }
    Write-Host "Backend subido y Passenger reiniciado." -ForegroundColor Green
    Write-Host "  Si agregaste dependencias nuevas (package.json cambio, ej. socket.io), entra al hPanel > esa Aplicacion Node.js > 'Ejecutar NPM Install' despues de este deploy." -ForegroundColor Yellow
}

Write-Host "`nDeploy completado. https://$($cfg.DOMAIN)" -ForegroundColor Green
if ($cfg.HasFrontend -and -not $BackendOnly -and -not $SkipExe -and $cfg.GUI_EXE -and (Test-Path $cfg.GUI_EXE)) {
    Write-Host "  .exe en: https://$($cfg.DOMAIN)/downloads/VisorReportesCampo.exe" -ForegroundColor DarkCyan
}
