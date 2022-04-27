import { FastifyReply } from "fastify";

export function send500(reply: FastifyReply) {
  return reply.status(500).send({ message: "Internal Server Error" });
}

export function send401(reply: FastifyReply) {
  return reply.status(401).send({ message: "Access Denied" });
}

