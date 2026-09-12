 
cd E:\PYME\bot\agro-bot-node\agro-bot-node
npm start
 
Y en otra terminal (Caddy tiene que estar corriendo para que el dominio funcione — si ya lo tenías corriendo como servicio de Windows, con un reload basta; si no, arráncalo):

-cd E:\PYME\deploy
.\caddy_windows_amd64.exe run --config Caddyfile


(o si ya lo instalaste como servicio con install-service, en vez de correrlo así usa .\caddy_windows_amd64.exe reload --config Caddyfile para que tome el bloque nuevo sin reiniciar todo).

Para confirmar que ya quedó público, desde tu celular con datos móviles (no wifi de casa):

-curl -I https://bot.buildwiselabs.duckdns.org
 
 (esuchar en puertos locales)
-Get-NetTCPConnection -LocalPort 80,443 - State Listen

-Get-Process - Id (Get-NetTCPConnection -LocalPort 443 - State Listen).OwningProcess

 (prueba de connectividad basica al puerto) desde la misma PC
-Test-NetConnection -ComputerName localhost -Port 80
-Test-NetConnection -ComputerName localhost -Port 443

Busca que diga TcpTestSucceeded : True.

 (probar dominio directamente)

-Test-NetConnection -ComputerName bot.buildwiselabs.duckdns.org -Port 443

NOTA# 
Ojo con esto: si lo corres conectado al wifi de tu casa,
algunos routers no soportan "hairpin NAT" (acceder a tu propia IP pública desde adentro de la misma red) 
y te va a fallar aunque todo esté bien configurado — por eso antes te recomendé probar desde datos móviles. 
Si quieres probarlo desde la misma PC de todos modos, 
este comando es el que usarías, solo no le creas un FALSE al 100% sin haber probado también desde afuera.

Probar HTTPS de verdar (Respuesta y Certificado)

-curl.exe -I https://bot.buildwiselabs.duckdns.org

Revisar que el Firewall de Windows no esté bloqueando la entrada (esto sí puede necesitar PowerShell como Administrador):

-Get-NetFirewallRule -Direction Inbound -Enabled True | Where-Object { $_.DisplayName -match "Caddy|HTTP" }



Actualizar 
-powershell -ExecutionPolicy Bypass -File "E:\PYME\deploy\duck.ps1"