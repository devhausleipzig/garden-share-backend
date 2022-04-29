//@ts-nocheck

export const tags = [
  {
    name: "Garden",
    description: "Endpoints related to the garden model",
  },
];

export function router(fastify, opts) {
  fastify.get(
    "/garden",
    {
      schema: {
        description: "Get all gardens in the app",
        tags: ["Garden"],
      },
    },
    (request, reply) => {}
  );
}
