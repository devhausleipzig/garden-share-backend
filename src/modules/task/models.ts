import { TaskType } from "@prisma/client";
import { Type } from "@sinclair/typebox";

export const CreateTaskModel = Type.Object({
  type: TaskType,
  deadline: Type.DateTime(),
  steps: Type.Array,
});
