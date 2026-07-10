# ---- Stage 1: build the static React app ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# No VITE_API_URL is passed here on purpose, so the app falls back to
# the relative "/api" path at build time. See src/api.js and nginx.conf.
RUN npm run build

# ---- Stage 2: serve the build with nginx ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
