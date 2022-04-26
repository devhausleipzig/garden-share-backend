import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import { CreateMessageModel } from "./models";

export const tags = [
  {
    name: "Message",
    description: "Example description for message-related endpoints",
  },
];

export const models = { CreateMessageModel };

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get<{ Querystring: { limit: number } }>(
    "/messages",
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

  fastify.post<{ Body: Static<typeof CreateMessageModel> }>(
    "/messages",
    {
      schema: {
        body: CreateMessageModel,
      },
    },
    async (request, reply) => {
      const { title, content, userId } = request.body;
      try {
        const message = await prisma.message.create({
          data: {
            title,
            content,
            author: {
              connect: {
                identifier: userId,
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
}
