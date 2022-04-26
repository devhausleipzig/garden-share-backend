import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import { GetAvailableTaskModel } from "./models";
import { Task } from "@prisma/client";

export const tags = [
  {
    name: "Tasks",
    description: "Example description for task-related endpoints",
  },
];

export const models = {};

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get<{
    Body: Static<typeof GetAvailableTaskModel>;
    Querystring: { available: boolean };
  }>(
    "/tasks",
    {
      schema: {
        querystring: { available: Type.Boolean() },
        description:
          "GETs you all available tasks based on wether a task is booked or not",
        tags: ["Tasks"],
      },
    },
    async (request, reply) => {
      const { available } = request.query;

      try {
        let tasks: Task[];
        if (available === undefined) {
          tasks = await prisma.task.findMany();
        } else {
          tasks = await prisma.task.findMany({
            where: {
              bookingId: available ? { not: null } : { equals: null },
            },
          });
        }

        reply.send(tasks);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
