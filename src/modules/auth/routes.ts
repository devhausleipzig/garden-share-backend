import { send500 } from "../../utils/errors";
import { FastifyInstance, RouteOptions, Static, prisma } from "../base.routes";

import { LoginModel, SignupModel } from "./models";

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.post<{ Body: Static<typeof SignupModel> }>(
    "/signup",
    {
      schema: {
        body: SignupModel,
      },
    },
    async (request, reply) => {
      const { email, firstName, lastName } = request.body;
      try {
        const loginEmail = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (loginEmail)
          return reply.status(403).send({
            message: "Email is already assigned",
          });
        const user = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            passwordHash: "placeholder",
            passwordSalt: "salt",
          },
        });
        reply.send(user.identifier);
      } catch (err) {
        fastify.log.error(err);
        send500(reply);
      }
    }
  );

  fastify.post<{ Body: Static<typeof LoginModel> }>(
    "/login",
    {
      schema: {
        body: LoginModel,
      },
    },
    async (request, reply) => {
      const { email, passwordHash } = request.body;
      try {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        console.log(user?.approved);
        if (!user)
          return reply.status(404).send({
            message: "User not found!",
          });
        if (passwordHash !== user.passwordHash)
          return reply.status(401).send({
            message: "Incorrect Password",
          });
        // @ts-ignore
        if (user.approved !== true)
          return reply.status(401).send({
            message: "User not approved!",
          });
        const token = fastify.jwt.sign({
          identifier: user.identifier,
          email: user.email,
          role: user.role,
        });

        reply.status(200).send({ token });
      } catch (err) {
        fastify.log.error(err);
        send500(reply);
      }
    }
  );
}
