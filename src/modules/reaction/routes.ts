import {
  FastifyInstance,
  RouteOptions,
  Static,
  Type,
  prisma,
} from "../base.routes";
import { send500 } from "../../utils/errors";
import { CreateReactionModel } from "./models";

export const tags = [
  {
    name: "Reactions",
    description: "Endpoints related to Reactions",
  },
];

export const models = { CreateReactionModel };

type GetReactionType = {
  Params: {
    id: string;
  };
};

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  fastify.get<GetReactionType>(
    "/messages/:id/reactions",
    {
      schema: {
        params: {
          id: Type.String({ format: "uuid" }),
        },
        description: "GETs you all reactions related to a specific user",
        tags: ["Reactions"],
        headers: {
          authorization: Type.String(),
        },
      },
      //@ts-ignore
      onRequest: fastify.authenticate,
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const reactions = await prisma.reaction.findMany({
          where: { messageId: id },
        });
        reply.send(reactions);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.post<{
    Body: Static<typeof CreateReactionModel>;
    Params: { id: string };
  }>(
    "/messages/:id/reactions",
    {
      schema: {
        body: CreateReactionModel,
        params: {
          id: Type.String({ format: "uuid" }),
        },
        description: "POSTs a new reaction based on the message id",
        tags: ["Reactions"],
        headers: {
          authorization: Type.String(),
        },
        //@ts-ignore
        onRequest: fastify.authenticate,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const reaction = await prisma.reaction.create({
          data: {
            ...request.body,
            message: { connect: { identifier: id } },
          },
        });
        reply.send(reaction.emoji);
      } catch (err) {
        send500(reply);
      }
    }
  );

  fastify.delete<GetReactionType>(
    "/reactions/:id",
    {
      schema: {
        params: {
          id: Type.String({ format: "uuid" }),
        },
        description: "DELETEs a specific reaction",
        tags: ["Reactions"],
        headers: {
          authorization: Type.String(),
        },
        //@ts-ignore
        onRequest: fastify.authenticate,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const deleteReaction = await prisma.reaction.delete({
          where: { identifier: id },
        });
        reply.send(`Sucessfully deleted: ${id}`);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
