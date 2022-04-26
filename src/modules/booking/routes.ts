// third-party imports
import {
  Static,
  Type,
  prisma,
  FastifyInstance,
  RouteOptions,
} from "../base.routes";

// local imports
import { CreateBookingModel } from "./models";
import { send500 } from "../../utils/errors";
import { checkOneHourApart } from "../../utils/date";

export const tags = [
  {
    name: "Booking",
    description: "Example description for user-related endpoints",
  },
];

export const models = { CreateBookingModel };

export function router(fastify: FastifyInstance, opts: RouteOptions) {
  // booking endpoints

  fastify.post<{
    Body: Static<typeof CreateBookingModel>;
    Params: { id: string };
  }>(
    "/user/:id/bookings",
    {
      schema: {
        body: CreateBookingModel,
      },
    },
    async (request, reply) => {
      const { bookedBy, tasks, ...rest } = request.body;
      const { id } = request.params;
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
            message: {
              create: {
                ...rest.message,
                author: {
                  connect: {
                    identifier: id,
                  },
                },
              },
            },
            bookedBy: { connect: { identifier: id } },
            tasks: { connect: tasks.map((task) => ({ identifier: task })) },
          },
        });
        reply.send(booking.identifier);
      } catch (err) {
        console.log(err);
        send500(reply);
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/booking/:id",
    async (request, reply) => {
      const { id } = request.params;
      try {
        const deleteBooking = await prisma.booking.delete({
          where: { identifier: id },
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

  // ----- Events ----- //

  fastify.get<{ Querystring: { limit: number } }>(
    "/events",
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
        const events = await prisma.booking.findMany({
          where: {
            private: false,
          },
          take: limit,
          orderBy: {
            start: "desc",
          },
        });
        reply.status(200).send(events);
      } catch (err) {
        send500(reply);
        console.log(err);
      }
    }
  );
}
