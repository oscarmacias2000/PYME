 $wsl = (wsl hostname -I).Trim().Split(" ")[0]
 netsh interface portproxy reset
 netsh interface portproxy add v4tov4 listenport=80  connectport=80  connectaddress=$wsl
 netsh interface portproxy add v4tov4 listenport=443 connectport=443 connectaddress=$wsl