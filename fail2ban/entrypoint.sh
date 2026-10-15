#!/bin/sh
set -e

# Crear directorios y archivos de registro
mkdir -p /var/log/nginx /var/run/fail2ban
touch /var/log/nginx/access.log /var/log/nginx/error.log

# Iniciar Fail2ban
fail2ban-server -f -x &
FAIL2BAN_PID=$!

# Iniciar Nginx
nginx -g 'daemon off;' &
NGINX_PID=$!

# Detener los procesos al apagar el contenedor
cleanup() {
    kill "$NGINX_PID" "$FAIL2BAN_PID" 2>/dev/null || true
}

trap cleanup TERM INT

wait "$NGINX_PID"

