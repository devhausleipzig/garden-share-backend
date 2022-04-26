// ----- EVENTS ----- //

app.get<{ Querystring: { limit: number } }>(
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
    }
  }
);
