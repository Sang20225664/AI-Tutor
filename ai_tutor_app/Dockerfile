# Stage 1: Build Flutter Web
FROM ghcr.io/cirruslabs/flutter:latest AS build-env
WORKDIR /app
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get
COPY . .
RUN flutter build web --release

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Create cache directory and set permissions for nginx
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/run/nginx && \
    chmod -R 777 /var/cache/nginx && \
    chmod -R 777 /var/run

# Remove default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/nginx.conf

# Copy main nginx configuration with tmp pid
COPY nginx.main.conf /etc/nginx/nginx.conf

# Copy custom server configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Flutter Web build output
COPY --from=build-env /app/build/web /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
