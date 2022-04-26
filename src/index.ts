import { Prisma, PrismaClient } from "@prisma/client";
import { fastify, FastifyInstance, RouteOptions } from "fastify";
import { Static, Type } from "@sinclair/typebox";
import fastifySwagger from "fastify-swagger";
import { resolve } from "path";
import { response } from "express";
import { send500 } from "./utils/errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { addListener, title } from "process";
import { checkOneHourApart } from "./utils/date";
import { request } from "http";

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

// Auth Signup Endpoint
const SignupModel = Type.Object({
  email: Type.String({ format: "email" }),
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  password: Type.String({ minLength: 6 }),
});

app.post<{ Body: Static<typeof SignupModel> }>(
  "/signup",
  {
    schema: {
      body: SignupModel
    },
    
  },
  async (request, reply) => {
    const { email } = request.body;
    try {
      const loginEmail = await prisma.user.findFirst({
        where: {
          email: email 
        },
      });
      if (loginEmail)
        return reply.status(403).send({
          message: "Email is already assigned",
        });
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

// Create Login Endpoint
const LoginModel = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 6 }),
});
app.post<{ Body: Static<typeof LoginModel> }>(
  "/login",
  {
    schema: {
      body: LoginModel,
    },
  },
  async (request, reply) => {
    const { email, password } = request.body;
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email
        },
      });
      if (!user)
        return reply.status(404).send({
          message: "User not found!",
        });
      if (password !== user.password)
        return reply.status(401).send({
          message: "Incorrect Password",
        });
      reply.status(200).send(user);
    } catch (err) {
      send500(reply);
    }
  }
);

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

// booking endpoints

const CreateBookingModel = Type.Object({
  start: Type.String({ format: "date-time" }),
  end: Type.String({ format: "date-time" }),
  private: Type.Optional(Type.Boolean()),
  overnight: Type.Optional(Type.Boolean()),
  published: Type.Optional(Type.Boolean()),
  title: Type.Optional(Type.String()),
  tasks: Type.Array(Type.String({ format: "uuid" })),
  bookedBy: Type.String({ format: "uuid" }),
  message: Type.Optional(Type.String({ format: "uuid" })),
});

app.post<{ Body: Static<typeof CreateBookingModel> }>(
  "/booking",
  {
    schema: {
      body: CreateBookingModel,
    },
  },
  async (request, reply) => {
    const { bookedBy, tasks, ...rest } = request.body;
    if (rest.start >= rest.end) {
      return reply.status(400).send("End time must be after start time.");
    }
    if (!checkOneHourApart(new Date(rest.start), new Date(rest.end))) {
      return reply
        .status(400)
        .send("Start and end time need to be one hour apart.");
    }
    try {
      const booking = await prisma.booking.create({
        data: {
          ...rest,
          bookedBy: { connect: { id: bookedBy } },
          tasks: { connect: tasks.map((task) => ({ id: task })) },
        },
      });
      reply.send(booking.id);
    } catch (err) {
      send500(reply);
    }
  }
);

app.delete<{ Params: { id: string } }>(
  "/booking/:id",
  async (request, reply) => {
    const { id } = request.params;
    try {
      const deleteBooking = await prisma.booking.delete({
        where: { id: String(id) },
      });
      // if (id !== deleteBooking.id) {
      //   return reply.send("Booking not found.");
      // }
      return reply.send("Booking successfully deleted.");
    } catch (err) {
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
