FROM ghcr.io/cirruslabs/flutter:latest AS build-env
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get
COPY . .
RUN flutter build web --release
FROM nginx:alpine
RUN apk add --no-cache curl
RUN apk add --no-cache curl shadow
RUN addgroup -S app && adduser -S -G app -u 1001 app || true
COPY --from=build-env /app/build/web /usr/share/nginx/html
RUN chown -R app:app /usr/share/nginx/html || true
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.main.conf /etc/nginx/nginx.conf
COPY ssl /etc/nginx/ssl
# Create nginx runtime/cache dirs and give ownership to non-root user `app`
RUN mkdir -p /var/cache/nginx/client_temp \
    /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp \
    /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp \
    /var/run && \
    chown -R 1001:1001 /var/cache/nginx /var/run /var/log || true
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1
EXPOSE 8080
USER app
CMD ["nginx", "-g", "daemon off;"]