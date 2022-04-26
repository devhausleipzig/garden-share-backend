// third-party imports
import {
  Static,
  Type,
  prisma,
  FastifyInstance,
  RouteOptions,
} from "../base.routes";

// local imports
import { send500 } from "../../utils/errors";

export const tags = [
  {
    name: "User",
    description: "Example description for user-related endpoints",
  },
];

export const models = {};

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  // ----- EVENTS ----- //

  fastify.get<{ Querystring: { limit: number } }>(
    "/events",
    {
      schema: {
        querystring: {
          limit: Type.Number(),
        },
      },
    },
    async (request, reply) => {
      const { limit } = request.query;
      try {
        const events = await prisma.booking.findMany({
          where: {
            private: false,
          },
          take: limit,
          orderBy: {
            start: "desc",
          },
        });
        reply.status(200).send(events);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
