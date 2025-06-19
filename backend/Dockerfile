FROM node:18-alpine

WORKDIR /app

# Install required compilers and runtimes
RUN apk update && apk add --no-cache \
    g++ \
    python3 \
    openjdk11-jre \
    openjdk11 \
    && rm -rf /var/cache/apk/*

COPY package*.json ./
RUN npm install --production=false

COPY . .

RUN mkdir -p /app/compiler/codes /app/compiler/inputs /app/compiler/outputs

EXPOSE 3000

CMD ["node", "server.js"]