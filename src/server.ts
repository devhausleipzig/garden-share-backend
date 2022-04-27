// third-party imports
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import fastifySwagger from "fastify-swagger";
import fastifyJwt from 'fastify-jwt';
import * as dotenv from 'dotenv';

// local imports
import { router, tags, models } from "./router";
import {security } from "./security"
import { loadEnv } from "./utils/env";
import { send401 } from "./utils/errors";

dotenv.config();

const server = fastify({ logger: process.env.NODE_ENV == "development" });

server.register(fastifySwagger, {
  exposeRoute: true,
  routePrefix: "/docs",
  swagger: {
    info: { title: "garden-share-api", version: "0.2.0" },
    tags,
    definitions: models,
  },
});

server.register(fastifyJwt, {
  secret: loadEnv('SESSION_SECRET')
})

server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
      const authenticated = await request.jwtVerify()
      
      if(!authenticated){
          send401(reply)
      }
  } catch (err) {
      send401(reply)
  }
});

server.register(security)

server.register(router)

try {
  server.ready()
  .then( () => server.listen(8000, "0.0.0.0"))
} catch (err) {
  server.log.error(err);
}
