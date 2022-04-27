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
import { getDaysInMonth, validateMonth } from "../../utils/month";

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
        params: { id: Type.String() },
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

  // ----- Availability ----- ///

  fastify.get<{ Querystring: { month: number } }>(
    "/availability",
    {
      schema: {
        querystring: {
          month: Type.Number(),
        },
      },
    },
    async (request, reply) => {
      const { month } = request.query;

      // [{
      //  date: days[]
      //  status: free | partial | full
      //  }]
      // array von tagen, forEach
      let availability = [];
      let status = [];
      getDaysInMonth(2022, month - 1);
      days.forEach(async (element, index) => {
        try {
          availability = await prisma.booking.findMany();
        } catch (err) {
          console.log(err);
          send500(reply);
        }
        if ((availability.length = 0)) {
          status.push("free");
        }
        if (availability.length < 12) {
          status.push("partial");
        }
        if ((availability.length = 12)) {
          status.push("full");
        }
      });
    }
  );
}
