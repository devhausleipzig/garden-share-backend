import { TaskType } from "@prisma/client";
import { Type } from "@sinclair/typebox";

export const CreateTaskModel = Type.Object({
  type: Type.Enum(TaskType),
  deadline: Type.String(),
  steps: Type.Array(Type.String()),
});
