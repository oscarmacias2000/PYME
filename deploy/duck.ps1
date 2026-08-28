# Actualizador de IP para DuckDNS (Windows / PowerShell).
# Ejecuta manualmente: powershell -ExecutionPolicy Bypass -File duck.ps1
# O programa en Task Scheduler para que corra cada 5 min (ver README-windows.md).

$sub   = "buildwiselabs"
$token = "3f59efc3-9a75-4b49-8d24-84bd5849a94c"
$log   = "$PSScriptRoot\duck.log"

$url = "https://www.duckdns.org/update?domains=$sub&token=$token&ip="
try {
    $text = (New-Object System.Net.WebClient).DownloadString($url).Trim()
    $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts $text" | Out-File -FilePath $log -Encoding utf8
    Write-Host "$ts $text"
} catch {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts ERROR: $_" | Out-File -FilePath $log -Encoding utf8 -Append
    Write-Host "$ts ERROR: $_"
}

