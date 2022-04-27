import { Type } from "@sinclair/typebox";

export const CreateMessageModel = Type.Object({
  title: Type.String(),
  content: Type.String(),
  userId: Type.String({ format: "uuid" }),
});

// export const BookingMessageModel = Type.Object({
//   title: Type.String(),
//   content: Type.String(),

// })
