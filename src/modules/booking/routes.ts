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
import { Message } from "@prisma/client";

export const tags = [
  {
    name: "Booking",
    description: "Here you will find details to all booking-related endpoints",
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
        params: { id: Type.String() },
        description: "POSTs a new booking",
        tags: ["Booking"],
      },
    },
    async (request, reply) => {
      const {
        bookedBy,
        tasks,
        end,
        start,
        message,
        overnight,
        private: privateBooking,
        published,
        title,
      } = request.body;
      const { id } = request.params;
      if (start >= end) {
        return reply.status(400).send("End time must be after start time.");
      }
      if (!checkOneHourApart(new Date(start), new Date(end))) {
        return reply
          .status(400)
          .send("Start and end time need to be one hour apart.");
      }
      try {
        let fetchedMessage: Message | undefined = undefined;
        if (message?.title && message?.content) {
          fetchedMessage = await prisma.message.create({
            data: {
              title: message.title,
              content: message.content,
              userId: id,
            },
          });
        }
        const booking = await prisma.booking.create({
          data: {
            end,
            start,
            overnight,
            private: privateBooking,
            published,
            title,
            userId: id,
            messageId: fetchedMessage?.identifier,
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
        description: "GETs you a certain number of events based on the limit",
        tags: ["Booking"],
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
  fastify.get<{ Querystring: { date: string } }>(
    "/bookings",
    {
      schema: {
        querystring: {
          date: Type.String({ format: "date" }),
        },
        description: "GETs you events by date",
        tags: ["Booking"],
      },
    },
    async (request, reply) => {
      const { date } = request.query;
      const startOfDay = new Date(date);

      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      try {
        const slots = await prisma.booking.findMany({
          where: {
            start: {
              lte: endOfDay,
              gte: startOfDay,
            },
          },
        });
        reply.status(200).send(slots);
      } catch (err) {
        send500(reply);
      }
    }
  );
}
