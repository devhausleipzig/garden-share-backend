import { Type } from "../base.models";

export const GetAvailableTaskModel = Type.Object({
  type: Type.String(),
  deadline: Type.String({ format: "date-time" }),
  steps: Type.Array(Type.String()),
  repeating: Type.String(),
  bookingId: Type.Optional(Type.String()),
});
