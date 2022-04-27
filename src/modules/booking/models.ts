import { Type } from "../base.models";
import { CreateMessageModel } from "../message/models";

export const CreateBookingModel = Type.Object({
  start: Type.String({ format: "date-time" }),
  end: Type.String({ format: "date-time" }),
  private: Type.Optional(Type.Boolean()),
  overnight: Type.Optional(Type.Boolean()),
  published: Type.Optional(Type.Boolean()),
  title: Type.Optional(Type.String()),
  tasks: Type.Array(Type.String({ format: "uuid" })),
  bookedBy: Type.String({ format: "uuid" }),
  message: Type.Optional(CreateMessageModel),
});
