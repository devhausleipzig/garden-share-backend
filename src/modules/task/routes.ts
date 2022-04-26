import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import { CreateTaskModel } from "./models";

enum dueQuerey {
  today,
  week,
}

export const tags = [
  {
    name: "Message",
    description: "Example description for message-related endpoints",
  },
];
export const models = [CreateTaskModel];

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get(
    "/task",
    {
      schema: {
        querystring: {
          limit: Type.Number(),
          due: Type.Enum(dueQuerey),
        },
      },
    },
    async (request, reply) => {
      const { limit, due } = request.query;
      try {
        const tasks = await prisma.task.findMany({
          where: {
            deadline: {
              equals: new Date(),
            },
          },
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        });
        reply.status(200).send(tasks);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
