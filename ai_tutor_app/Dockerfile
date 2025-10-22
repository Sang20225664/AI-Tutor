FROM ghcr.io/cirruslabs/flutter:latest AS build-env
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get
COPY . .
RUN flutter build web --release
FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=build-env /app/build/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]