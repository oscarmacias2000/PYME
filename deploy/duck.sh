#!/bin/bash
# Actualizador de IP para DuckDNS.
# 1) Reemplaza TUSUB por tu subdominio (sin ".duckdns.org").
# 2) Reemplaza TU_TOKEN por el token de tu panel duckdns.org.
# Instalar en el SERVIDOR LINUX (no en Windows):
#   mkdir -p ~/duckdns && cp duck.sh ~/duckdns/ && chmod 700 ~/duckdns/duck.sh
#   ~/duckdns/duck.sh && cat ~/duckdns/duck.log   # debe imprimir: OK

DUCKDNS_SUB="buildwiselabs"
DUCKDNS_TOKEN="3f59efc3-9a75-4b49-8d24-84bd5849a94c"

echo url="https://www.duckdns.org/update?domains=${DUCKDNS_SUB}&token=${DUCKDNS_TOKEN}&ip=" \
  | curl -k -o ~/duckdns/duck.log -K -


