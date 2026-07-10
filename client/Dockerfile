# ---- Stage 1: Build the React app with Vite ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# VITE_API_URL is a BUILD-TIME argument. Vite bundles this value directly
# into the compiled JavaScript, so it must be provided at `docker build`
# time (see docker-compose.yml "build.args"), not at container runtime.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: Serve the built static files with nginx ----
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
