FROM node:20-alpine

WORKDIR /app

# Install curl
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production

CMD ["npm", "start"]