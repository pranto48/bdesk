# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false
RUN npm ci
RUN npm install -g vite
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 2266
CMD ["nginx", "-g", "daemon off;"]