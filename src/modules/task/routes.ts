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

type dueQuery = "today" | "week";

export const tags = [
  {
    name: "Tasks",
    description: "Endpoints related to Tasks",
  },
];
export const models = { CreateTaskModel, GetAvailableTaskModel };

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get<{
    Querystring: { limit: number; due: dueQuery; available: boolean };
  }>(
    "/task",
    {
      schema: {
        querystring: {
          available: Type.Boolean(),
          limit: Type.Number(),
          due: Type.Union([Type.Literal("today"), Type.Literal("week")]),
        },

        description:
          "GETs you a certain number of tasks sorted by due date and if it's booked or not",
        tags: ["Tasks"],
        // headers: {
        //   authorization: Type.String(),
        // },
      },
      //@ts-ignore
      // onRequest: fastify.authenticate,
    },
    async (request, reply) => {
      const { limit, due, available } = request.query;
      const date = new Date();
      let date2 = new Date();
      date2.setDate(date2.getDate() + 7);
      const todaysDate = date.toISOString().substring(0, 10);
      const oneWeek = date2.toISOString().substring(0, 10);

      try {
        let tasks: Task[];
        let whereClauses: { AND: any[] } = {
          AND: [],
        };
        if (due) {
          whereClauses.AND.push({
            deadline: {
              lte: due === "today" ? new Date(todaysDate) : new Date(oneWeek),
              gte: new Date(todaysDate),
            },
          });
        }
        if (available != undefined) {
          whereClauses.AND.push({
            bookingId: available ? { equals: null } : { not: null },
          });
        }

        tasks = await prisma.task.findMany({
          where: whereClauses,
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

  fastify.post<{
    Body: Static<typeof CreateTaskModel>;
  }>(
    "/task",
    {
      schema: {
        body: CreateTaskModel,

        querystring: { available: Type.Boolean() },
        description: "POST: Create a new Task",
        tags: ["Tasks"],
        // headers: {
        //   authorization: Type.String(),
        // },
      },
      //@ts-ignore
      // onRequest: fastify.au==thenticate,
    },

    async (req, reply) => {
      const { steps, deadline, ...rest } = req.body;

      try {
        const newTask = await prisma.task.create({
          data: {
            ...rest,
            deadline: new Date(deadline),
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
    {
      schema: {
        params: {
          id: Type.String(),
        },
        description: "DELETE: delete the selected Task by 'id' ",
        tags: ["Tasks"],
        headers: {
          authorization: Type.String(),
        },
      },
      // @ts-ignore
      onRequest: fastify.authenticate,
    },
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
        description: "modify a task",
        tags: ["Tasks"],
        params: {
          id: Type.String({ format: "uuid" }),
        },
        body: UpdateTaskModel,
        headers: {
          authorization: Type.String(),
        },
      },
      // @ts-ignore
      onRequest: fastify.authenticate,
    },
    async (req, reply) => {
      const { id } = req.params;
      //  const {type, deadline, steps, repeating, available} = req.body;
      const { steps, deadline, ...rest } = req.body;
      try {
        const updatedTask = await prisma.task.update({
          data: {
            ...rest,
            deadline: new Date(deadline),
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
