import { Prisma, PrismaClient } from "@prisma/client";
import { fastify, FastifyInstance, RouteOptions } from "fastify";
import { Static, Type, TEnum, TEnumKey } from "@sinclair/typebox";
import fastifySwagger from "fastify-swagger";
import { resolve } from "path";
import { response } from "express";
import { send500 } from "./utils/errors";

const prisma = new PrismaClient();
const app = fastify({ logger: true });

// write utility for gathering tags from "component" folders
const tags: Array<{ name: string; description: string }> = [];

app.register(fastifySwagger, {
  exposeRoute: true,
  routePrefix: "/docs",
  swagger: {
    info: { title: "fastify-api", version: "0.1.0" },
  },
});

// write utility for gathering routes from "component" folders
const routes: Array<(fastify: FastifyInstance, options: RouteOptions) => void> =
  [];
routes.forEach((route) => {
  app.register(route);
});

app.get("/task", async (request, reply) => {
  try {
    const task = await prisma.task.findMany();
    reply.status(200).send(task);
  } catch (err) {
    send500(reply);
  }
});

type GetTaskType = {
  Params: {
    id: string;
  };
};

app.get<GetTaskType>(
  "/task/:id",
  {
    schema: {
      params: {
        id: Type.String({ format: "uuid" }),
      },
    },
  },
  async (request, reply) => {
    const { id } = request.params;
    try {
      const task = await prisma.task.findUnique({
        where: { id },
      });
      reply.send(task);
    } catch (err) {
      send500(reply);
    }
  }
);

// export function StringLiteralEnum<T extends string[]>(
//   values: [...T]
// ): TEnum<StringLiteralOptions<T>> {
//   const options = values.reduce(
//     (acc, c) => ({ ...acc, [c]: c }),
//     {}
//   ) as StringLiteralOptions<T>;
//   return Type.Enum(options as any) as any;
// }

// const T = StringLiteralEnum([
//   "HARVESTING",
//   "WATERING",
//   "PRUNING",
//   "SEEDING",
//   "BUILDING",
//   "WEEDING",
// ]);

// type T = Static<typeof T>;

// app.get("/task?due={today|week}?limit", {}, async (request, reply) => {
//   reply.status(200).send(task);
// });

const start = async () => {
  try {
    await app.listen(8000, "0.0.0.0");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
