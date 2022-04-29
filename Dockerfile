FROM node:16-buster-slim as base

# ---- compile image -----------------------------------------------
FROM base AS compile-image

RUN apt-get -qy update && apt-get -qy install openssl

# A wildcard is used to ensure both package.json AND package-lock.json are copied
RUN mkdir -p /app/prisma
COPY package*.json ./app
COPY tsconfig.json ./app
COPY prismix.config.json ./app
COPY ./prisma /app/prisma

COPY ./src /app/src
WORKDIR /app/src

# Install app dependencies
RUN npm install

CMD ["npm", "start"]
