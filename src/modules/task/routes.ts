import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import {
  CreateTaskModel,
  GetAvailableTaskModel,
  UpdateTaskModel,
} from "./models";
import { Task } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

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
        description: "GETs you a certain number of tasks sorted by due date",
        tags: ["Tasks"],
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
  fastify.post<{
    Body: Static<typeof CreateTaskModel>;
  }>(
    "/task",
    {
      schema: {
        body: CreateTaskModel,
      },
    },
    async (req, reply) => {
      const { steps, ...rest } = req.body;
      try {
        const newTask = await prisma.task.create({
          data: {
            ...rest,
            steps: JSON.stringify(steps),
          },
        });
        reply.code(201).send(newTask);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/task/:id",
    async (request, reply) => {
      const { id } = request.params;
      try {
        const deleteTask = await prisma.task.delete({
          where: { identifier: id },
        });
        return reply.send("Task successfully deleted.");
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.put<{
    Body: Static<typeof UpdateTaskModel>;
    Params: { id: string };
  }>(
    "/task/:id",
    {
      schema: {
        params: {
          id: Type.String({ format: "uuid" }),
        },
        body: UpdateTaskModel,
      },
    },
    async (req, reply) => {
      const { id } = req.params;
      //  const {type, deadline, steps, repeating, available} = req.body;
      const { steps, ...rest } = req.body;
      try {
        const updatedTask = await prisma.task.update({
          data: {
            ...rest,
            steps: JSON.stringify(steps),
          },
          where: {
            identifier: id,
          },
        });
      } catch (error) {
        send500(reply);
      }
    }
  );
}
