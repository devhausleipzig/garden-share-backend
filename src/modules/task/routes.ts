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
              deadline: "desc",
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
  }>(
    "/tasks",
    {
      schema: {
        description:
          "GETs you all available tasks based on wether a task is booked or not",
        tags: ["Tasks"],
      },
    },
    async (request, reply) => {
      try {
        let tasks: Task[];

        tasks = await prisma.task.findMany({
          where: {
            bookingId: { equals: null },
          },
          orderBy: [
            {
              deadline: "asc",
            },
          ],
        });

        reply.send(tasks);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/task/:id",
    {
      schema: {
        description: "GETs you a single task by id",
        tags: ["Tasks"],
        params: {
          id: Type.String({ format: "uuid" }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const singleTask = await prisma.task.findUnique({
          where: { identifier: id },
        });
        reply.send(singleTask);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.post<{
    Body: Static<typeof CreateTaskModel>;
  }>(
    "/tasks",
    {
      schema: {
        body: CreateTaskModel,
        description: "POSTs a new task ",
        tags: ["Tasks"],
      },
    },
    async (request, reply) => {
      const { type, repeating, deadline, steps } = request.body;
      try {
        const task = await prisma.task.create({
          data: {
            ...request.body,
          },
        });
        reply.send(task.identifier);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
