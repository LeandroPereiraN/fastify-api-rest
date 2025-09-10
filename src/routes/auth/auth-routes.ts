import { User } from "../../types/User.ts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { AuthorizedError } from "../../models/errors.ts";
import UserRepository from "../../repositories/user-repository.ts";
import AuthRepository from "../../repositories/auth-repository.ts";

const userRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post('/login', {
    schema: {
      tags: ["auth"],
      summary: "Obtiene un token JWT",
      description: "Autentica usuario y contraseña, devuelve un token JWT si es correcto",
      body: Type.Object({
        username: Type.String({ minLength: 2 }),
        password: Type.String()
      }),
      response: {
        200: Type.Object({ token: Type.String() }),
        401: Type.Object({ message: Type.String() })
      }
    }
  }, async (req, res) => {
    const { username, password } = req.body;

    const user = await AuthRepository.login(username, password);
    if (!user) {
      throw new AuthorizedError("Usuario no encontrado");
    }

    const token = fastify.jwt.sign({
      id_usuario: user.id_usuario,
      nombres: user.nombres,
      roles: user.roles
    }, {
      expiresIn: '1h',
      notBefore: '0s',
    });

    return { token };
  })

  fastify.post('/register', {
    schema: {
      summary: 'Crea un nuevo usuario',
      description: 'Crea un nuevo usuario en la base de datos',
      tags: ["auth"],
      body: Type.Intersect([
        Type.Omit(User, ["id_usuario"]),
        Type.Object({
          password: Type.String({ minLength: 6 }),
          roles: Type.Optional(Type.Array(Type.String()))
        })
      ]),
      response: {
        201: User
      }
    }
  }, async (req, res) => {
    const { password, roles, ...userData } = req.body;
    const newUser = await UserRepository.createUser({
      ...userData,
      password,
      roles
    });

    res.status(201).send(newUser);
  })
}

export default userRoutes