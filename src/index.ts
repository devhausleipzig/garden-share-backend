import { Prisma, PrismaClient } from "@prisma/client";
import { fastify, FastifyInstance, RouteOptions } from "fastify";
import { Static, Type } from "@sinclair/typebox";
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

app.get("/", {}, async (request, reply) => {
  reply.send("hello");
});

app.get("/users", async (request, reply) => {
  try {
    const users = await prisma.user.findMany();
    reply.status(200).send(users);
  } catch (err) {
    send500(reply);
  }
});

const CreateUserModel = Type.Object({
  email: Type.String({ format: "email" }),
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  password: Type.String({ minLength: 6 }),
});

app.post<{ Body: Static<typeof CreateUserModel> }>(
  "/users",
  {
    schema: {
      body: CreateUserModel,
    },
  },
  async (request, reply) => {
    try {
      const user = await prisma.user.create({
        data: {
          ...request.body,
        },
      });
      reply.send(user.id);
    } catch (err) {
      send500(reply);
    }
  }
);

type GetUserType = {
  Params: {
    id: string;
  };
};

app.get<GetUserType>(
  "/users/:id",
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
      const user = await prisma.user.findUnique({
        where: { id },
      });
      reply.send(user);
    } catch (err) {
      send500(reply);
    }
  }
);

// ----- MESSAGES -----  //

// get a few for dashboard
app.get<{ Querystring: { limit: number } }>(
  "/message",
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
      const messages = await prisma.message.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });
      reply.status(200).send(messages);
    } catch (err) {
      send500(reply);
    }
  }
);

// post a message
const CreateMessageModel = Type.Object({
  title: Type.String(),
  content: Type.String(),
  authorId: Type.String({ format: "uuid" }),
});

app.post<{ Body: Static<typeof CreateMessageModel> }>(
  "/message",
  {
    schema: {
      body: CreateMessageModel,
    },
  },
  async (request, reply) => {
    const { title, content, authorId } = request.body;
    try {
      const message = await prisma.message.create({
        data: {
          title,
          content,
          author: {
            connect: {
              id: authorId,
            },
          },
        },
      });
      reply.send(message);
    } catch (err) {
      console.log(err);
      send500(reply);
    }
  }
);

const start = async () => {
  try {
    await app.listen(8000, "0.0.0.0");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
