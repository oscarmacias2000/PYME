# Deploy script — BuildWise Labs
# Builds frontend + sube frontend y backend a Hostinger via WinSCP.
# Requiere WinSCP instalado: https://winscp.net

param(
    [switch]$FrontendOnly,
    [switch]$BackendOnly
)

# ── Configuracion ──────────────────────────────────────────────────────────────
$SFTP_HOST     = "buildwiselabs.net"
$SFTP_PORT     = 65002
$SFTP_USER     = "u695228895"
$REMOTE_NODE   = "/home/u695228895/domains/buildwiselabs.net/hbuilds/current/nodejs"
$REMOTE_PUBLIC = "$REMOTE_NODE/public"
$REMOTE_RESTART= "$REMOTE_NODE/tmp/restart.txt"

$EXPO_DIR      = "E:\PYME\expo"
$DIST_DIR      = "$EXPO_DIR\dist"
$BACKEND_DIR   = "E:\PYME\backend"

$WINSCP = "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
if (-not (Test-Path $WINSCP)) { $WINSCP = "$env:ProgramFiles\WinSCP\WinSCP.com" }
if (-not (Test-Path $WINSCP)) {
    Write-Host "ERROR: WinSCP no encontrado. Instala desde https://winscp.net" -ForegroundColor Red
    exit 1
}

# Pide la contrasena una vez
$pass = Read-Host "Contrasena SSH/SFTP de Hostinger" -AsSecureString
$plainPass = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass))

$session = "sftp://${SFTP_USER}:${plainPass}@${SFTP_HOST}:${SFTP_PORT}/"

# ── 1. Build frontend ──────────────────────────────────────────────────────────
if (-not $BackendOnly) {
    Write-Host "`n[1/3] Construyendo frontend..." -ForegroundColor Cyan
    Push-Location $EXPO_DIR
    npx expo export --platform web
    if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en el build." -ForegroundColor Red; exit 1 }
    Pop-Location
    Write-Host "Build listo en $DIST_DIR" -ForegroundColor Green
}

# ── 2. Subir frontend ──────────────────────────────────────────────────────────
if (-not $BackendOnly) {
    Write-Host "`n[2/3] Subiendo frontend a Hostinger..." -ForegroundColor Cyan
    $script = @"
open $session -hostkey=*
synchronize remote "$DIST_DIR" "$REMOTE_PUBLIC"
exit
"@
    $script | & $WINSCP /command /ini=nul /script=/dev/stdin
    Write-Host "Frontend subido." -ForegroundColor Green
}

# ── 3. Subir backend + restart ─────────────────────────────────────────────────
if (-not $FrontendOnly) {
    Write-Host "`n[3/3] Subiendo backend y reiniciando..." -ForegroundColor Cyan
    $script = @"
open $session -hostkey=*
synchronize remote "$BACKEND_DIR" "$REMOTE_NODE" -filemask="| node_modules/; dist/; public/; .git/; .env"
call touch $REMOTE_RESTART
exit
"@
    $script | & $WINSCP /command /ini=nul /script=/dev/stdin
    Write-Host "Backend subido y Passenger reiniciado." -ForegroundColor Green
}

Write-Host "`nDeploy completado. https://buildwiselabs.net" -ForegroundColor Green
