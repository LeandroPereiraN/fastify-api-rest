import { Type } from "@fastify/type-provider-typebox";
import type { Static } from "@fastify/type-provider-typebox";

export const SexoEnum = Type.Enum(
  { M: "M", F: "F" },
  { description: "Sexo del usuario: M (Masculino), F (Femenino)." }
);

export const User = Type.Object({
  id_usuario: Type.Integer(),
  username: Type.String({ minLength: 1, maxLength: 15 }),
  email: Type.String({ format: "email" }),
  activo: Type.Boolean(),
  fecha_registro: Type.String({ format: "date-time" }),
  reputacion: Type.Number({ minimum: 0, maximum: 999.99 }),
  preferencias: Type.Optional(Type.Any()),
  fecha_nacimiento: Type.String({ format: "date" }),
  nombres: Type.String({ minLength: 1, maxLength: 50 }),
  apellidos: Type.String({ minLength: 1, maxLength: 50 }),
  edad: Type.Integer({ minimum: 0, maximum: 100 }),
  sexo: SexoEnum,
  foto_url: Type.Optional(Type.String({ maxLength: 520 }))
}, {
  description: "Usuario del sistema."
});

export type User = Static<typeof User>;