import { Type } from "../base.models";

export const SignupModel = Type.Object({
  email: Type.String({ format: "email" }),
  firstName: Type.String({ minLength: 2 }),
  lastName: Type.String({ minLength: 2 }),
  passwordHash: Type.String({ minLength: 6 }),
});

export const LoginModel = Type.Object({
  email: Type.String({ format: "email" }),
  passwordHash: Type.String({ minLength: 6 }),
});
