FROM node:current-buster-slim as base

# ---- compile image -----------------------------------------------
FROM base AS compile-image

RUN apt-get -qy update && apt-get -qy install openssl

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm update
RUN npm install

COPY ./src /src
WORKDIR /

CMD ["npm", "start"]
