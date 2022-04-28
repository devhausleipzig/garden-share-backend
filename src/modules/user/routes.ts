// third-party imports
import {
  Static,
  Type,
  prisma,
  FastifyInstance,
  RouteOptions,
} from "../base.routes";

// local imports
import { CreateUserModel, UpdateRoleModel, UpdateUserModel } from "./models";
import { send401, send500 } from "../../utils/errors";

export const tags = [
  {
    name: "User",
    description: "Example description for user-related endpoints",
  },
];

export const models = { CreateUserModel, UpdateUserModel, UpdateRoleModel };

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get(
    "/users",
    {
      schema: {
        description: "GETs you all users",
        tags: ["User"],
        headers: {
          authorization: Type.String(),
        },
      },
      //@ts-ignore
      onRequest: fastify.authenticate,
    },
    async (request, reply) => {
      try {
        const users = await prisma.user.findMany();
        reply.status(200).send(users);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/users/:id",
    {
      schema: {
        description: "GETs you a specific user based on the user id",
        tags: ["User"],
        params: {
          id: Type.String({ format: "uuid" }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const user = await prisma.user.findUnique({
          where: { identifier: id },
        });
        reply.send(user);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.put<{ Body: Static<typeof UpdateUserModel>; Params: { id: string } }>(
    "/users/:id",
    {
      schema: {
        params: {
          id: Type.String({ format: "uuid" }),
        },
        body: UpdateUserModel,
        description: "PUTs (updates) an already exising user",
        tags: ["User"],
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const updatedUser = await prisma.user.update({
          where: { identifier: id },
          data: {
            ...request.body,
          },
        });
        reply.send(`Sucessfully updated user: ${id}`);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/users/:id",
    {
      schema: {
        params: {
          id: Type.String({ format: "uuid" }),
        },
        description: "DELETEs a specific user based on the user id",
        tags: ["User"],
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const deleteUser = await prisma.user.delete({
          where: { identifier: id },
        });
        reply.send(`Sucessfully deleted: ${id}`);
      } catch (err) {
        send500(reply);
      }
    }
  );

  // ADMIN CHANGES ROLE

  fastify.put<{ Body: Static<typeof UpdateRoleModel>; Params: { id: string } }>(
    "/user/:id/role",
    {
      schema: {
        params: {
          id: Type.String({ format: "uuid" }),
        },
        body: UpdateRoleModel,
        description: "PUTs (updates) user role (ADMIN only)",
        tags: ["User"],
        headers: {
          authorization: Type.String(),
        },
      },
      //@ts-ignore
      onRequest: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params;
      const { role } = request.body;
      // @ts-ignore
      if (!request.user.role === "ADMIN") {
        send401(reply);
      }
      try {
        const updateRole = await prisma.user.update({
          where: { identifier: id },
          data: {
            role,
          },
        });
        reply.status(200).send(updateRole);
      } catch (err) {
        console.log(err);
        send500(reply);
      }
    }
  );

  fastify.post<{ Body: Static<typeof CreateUserModel> }>(
    "/users",
    {
      schema: {
        body: CreateUserModel,
        description: "POSTs (i.e. creates) a new user",
        tags: ["User"],
      },
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.create({
          data: {
            ...request.body,
          },
        });
        reply.send(user.identifier);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
