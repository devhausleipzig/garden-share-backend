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
import { checkOneHourApart } from "../../utils/hour";
import { Message } from "@prisma/client";
import { getDayzInMonth } from "../../utils/month";
import { dateRange } from "../../utils/day";

export const tags = [
  {
    name: "Booking",
    description: "Endpoints related to Booking",
  },
];

export const models = { CreateBookingModel };

export function router(fastify: FastifyInstance, opts: RouteOptions) {
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
        headers: {
          authorization: Type.String(),
        },
      },
      // @ts-ignore
      onRequest: fastify.authenticate,
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
    {
      schema: {
        description: "Delete a booking",
        tags: ["Booking"],
        headers: {
          authorization: Type.String(),
        },
      },
      // @ts-ignore
      onRequest: fastify.authenticate,
    },
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

  // ----- Availability ----- ///

  fastify.get<{ Querystring: { month: number } }>(
    "/availability",
    {
      schema: {
        querystring: {
          month: Type.Number({ minimum: 1, maximum: 12 }),
        },
        description: "GETs the availability for a month",
        tags: ["Booking"],
        headers: {
          authorization: Type.String(),
        },
      },
      // @ts-ignore
      onRequest: fastify.authenticate,
    },
    async (request, reply) => {
      const { month } = request.query;
      let status: string[] = [];
      const days = getDayzInMonth(new Date().getFullYear(), month - 1);
      for (const day of days) {
        const availability = await dateRange(day.toISOString());
        if (availability.length === 0) {
          status.push("free");
        } else if (availability.length < 12) {
          status.push("partial");
        } else if (availability.length === 12) {
          status.push("full");
        }
      }

      reply.send(status);
    }
  );

  //  GET BOOKINGS BY DATE

  fastify.get<{ Querystring: { date: string } }>(
    "/bookings",
    {
      schema: {
        querystring: {
          date: Type.String({ format: "date" }),
        },
        description: "GETs you events by date",
        tags: ["Booking"],
        // headers: {
        //   authorization: Type.String(),
        // },
      },
      //@ts-ignore
      // onRequest: fastify.authenticate,
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
