# ---- Backend Dockerfile ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so Docker can cache this layer
# and skip re-installing when only source code changes.
COPY package*.json ./
RUN npm install --omit=dev

# Now copy the actual application source
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
