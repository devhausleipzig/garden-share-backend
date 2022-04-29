import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import { CreateTaskModel, GetAvailableTaskModel } from "./models";
import { Task } from "@prisma/client";

type dueQuery = "today" | "week";

export const tags = [
  {
    name: "Tasks",
    description: "Example description for task-related endpoints",
  },
];
export const models = [CreateTaskModel, GetAvailableTaskModel];

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get<{ Querystring: { limit: number; due: dueQuery } }>(
    "/task",
    {
      schema: {
        querystring: {
          limit: Type.Number(),
          due: Type.Union([Type.Literal("today"), Type.Literal("week")]),
        },
        headers: {
          authorization: Type.String(),
        },
      },
      //@ts-ignore
      onRequest: fastify.authenticate,
    },
    async (request, reply) => {
      const { limit, due } = request.query;
      const date = new Date();
      let date2 = new Date();
      date2.setDate(date2.getDate() + 7);
      const todaysDate = date.toISOString().substring(0, 10);
      const oneWeek = date2.toISOString().substring(0, 10);
      console.log(todaysDate, oneWeek);
      try {
        let tasks: Task[];
        if (!due) {
          tasks = await prisma.task.findMany();
        } else {
          tasks = await prisma.task.findMany({
            where: {
              deadline: {
                lte: due === "today" ? new Date(todaysDate) : new Date(oneWeek),
                gte: new Date(todaysDate),
              },
            },
            take: limit,
            orderBy: {
              createdAt: "desc",
            },
          });
        }
        reply.status(200).send(tasks);
      } catch (err) {
        send500(reply);
      }
    }
  );

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
        headers: {
          authorization: Type.String(),
        },
      },
      //@ts-ignore
      onRequest: fastify.authenticate,
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
