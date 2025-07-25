FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Замінюємо API_URL у зібраних файлах' >> /docker-entrypoint.sh && \
    echo 'if [ -n "$API_URL" ]; then' >> /docker-entrypoint.sh && \
    echo '  find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8000/api/v1|$API_URL|g" {} \;' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Запускаем nginx' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]