import { Repeats, TaskType } from "@prisma/client";
import { Type } from "../base.models";

export const CreateTaskModel = Type.Object({
  type: Type.Enum(TaskType),
  deadline: Type.String({ format: "date" }),
  steps: Type.String(),
  repeating: Type.Enum(Repeats),
});

export const GetAvailableTaskModel = Type.Object({
  type: Type.String(),
  deadline: Type.String({ format: "date" }),
  steps: Type.Array(Type.String()),
  repeating: Type.String(),
  bookingId: Type.Optional(Type.String()),
});
