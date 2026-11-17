FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package.json package-lock.json* ./
RUN npm ci

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]