
# Etapa 1: Construir la aplicación React
FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Servir React con Nginx y Fail2ban
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        fail2ban \
        iptables \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist /usr/share/nginx/html

COPY fail2ban/nginx.conf /etc/nginx/nginx.conf
COPY fail2ban/jail.local /etc/fail2ban/jail.local
COPY fail2ban/filter-http-flood.conf /etc/fail2ban/filter.d/http-flood.conf

COPY fail2ban/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5173

CMD ["/entrypoint.sh"]

