import { prisma } from "../modules/base.routes";

export async function dateRange(date: string) {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return prisma.booking.findMany({
    where: {
      start: {
        lte: endOfDay,
        gte: startOfDay,
      },
    },
  });
}
