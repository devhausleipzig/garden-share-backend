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
      const { email } = request.body;
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
            ...request.body,
            passwordHash: "placeholder",
            passwordSalt: "salt",
          },
        });
        reply.send(user.identifier);
      } catch (err) {
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
      const { email, password } = request.body;
      try {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (!user)
          return reply.status(404).send({
            message: "User not found!",
          });
        if (password !== user.passwordHash)
          return reply.status(401).send({
            message: "Incorrect Password",
          });
        reply.status(200).send(user);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
