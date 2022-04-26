import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import { CreateTaskModel } from "./models";
import { Task } from "@prisma/client";

type dueQuery = "today" | "week";

export const tags = [
  {
    name: "Message",
    description: "Example description for message-related endpoints",
  },
];
export const models = [CreateTaskModel];

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get<{ Querystring: { limit: number; due: dueQuery } }>(
    "/task",
    {
      schema: {
        querystring: {
          limit: Type.Number(),
          due: Type.Union([Type.Literal("today"), Type.Literal("week")]),
        },
      },
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
}
