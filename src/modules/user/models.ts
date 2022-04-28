// third-party imports
import { Role } from "@prisma/client";
import { Type } from "@sinclair/typebox";

export const CreateUserModel = Type.Object({
  email: Type.String({ format: "email" }),
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  passwordHash: Type.String(),
  passwordSalt: Type.String(),
});

export const ReadUserModel = Type.Object({
  identifier: Type.String({ format: "uuid" }),
  // etc...
});

export const UpdateUserModel = Type.Object({
  email: Type.Optional(Type.String({ format: "email" })),
  firstName: Type.Optional(Type.String({ minLength: 2 })),
  lastName: Type.Optional(Type.String({ minLength: 2 })),
  password: Type.Optional(Type.String({ minLength: 6 })),
});

export const UpdateRoleModel = Type.Object({
  role: Type.Enum(Role),
});
