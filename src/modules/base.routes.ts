export { FastifyInstance, RouteOptions } from "fastify";
export { Static, Type } from "@sinclair/typebox";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
