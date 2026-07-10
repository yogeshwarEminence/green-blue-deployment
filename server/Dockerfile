FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the source
COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["npm", "start"]
