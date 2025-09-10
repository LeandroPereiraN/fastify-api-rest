import { User } from "../../types/User.ts";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@fastify/type-provider-typebox";
import { NotFoundError, PermissionError } from "../../models/errors.ts";
import UserRepository from "../../repositories/user-repository.ts";

const userRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/usuarios', {
    schema: {
      summary: 'Devuelve una lista de usuarios',
      description: 'Devuelve el id, nombre e isAdmin',
      tags: ['usuarios'],
      querystring: Type.Object({
        nombre: Type.Optional(Type.String({ minLength: 2 }))
      }),
      response: {
        200: Type.Array(User),
        403: Type.Object({ message: Type.String() })
      },
      security: [
        { bearerAuth: [] }
      ]
    },
    onRequest: async (req, res) => {
      fastify.authenticate(req, res);

      const user = req.user as User;
      if (!user || !user.roles || !user.roles.some(rol => rol.nombre === 'admin')) {
        throw new PermissionError('No tienes permisos para realizar esta acción.');
      }
    }
  }, async (req, res) => {
    const query = req.query
    const { nombre } = query;

    if (!nombre) return await UserRepository.getUsers() as User[];

    return await UserRepository.getUsersByName(nombre) as User[];
  })

  fastify.get('/usuarios/:id_usuario', {
    schema: {
      summary: 'Devuelve un usuario por su ID',
      description: 'Devuelve el id, nombre e isAdmin del usuario. Solo disponible para administradores o el propio usuario.',
      tags: ['usuarios'],
      params: Type.Pick(User, ["id_usuario"]),
      response: {
        200: User,
        403: Type.Object({ message: Type.String() }),
        404: {
          description: 'Usuario no encontrado',
          type: 'object',
          properties: {
            message: { type: "string" }
          }
        }
      },
      security: [
        { bearerAuth: [] }
      ]
    },
    onRequest: async (req, res) => {
      fastify.authenticate(req, res);

      const user = req.user as User;
      const { id_usuario } = req.params;
      const isAdmin = user?.roles?.some(rol => rol.nombre === 'admin');
      const isSelf = user?.id_usuario === id_usuario;

      if (!isAdmin && !isSelf) {
        throw new PermissionError('No tienes permisos para ver este usuario.');
      }
    }
  }, async (req, res) => {
    const { id_usuario } = req.params;
    const user = await UserRepository.getUserById(id_usuario);
    if (user && user.id_usuario !== undefined) {
      return user;
    }

    throw new NotFoundError();
  })

  fastify.put('/usuarios/:id_usuario', {
    schema: {
      summary: 'Actualiza un usuario por su ID',
      description: 'Actualiza el nombre del usuario. Solo disponible para administradores o el propio usuario.',
      tags: ['usuarios'],
      params: Type.Pick(User, ["id_usuario"]),
      body: User,
      response: {
        204: {
          description: 'Usuario actualizado',
          type: 'null'
        },
        403: Type.Object({ message: Type.String() })
      },
      security: [
        { bearerAuth: [] }
      ]
    },
    onRequest: async (req, res) => {
      fastify.authenticate(req, res);

      const user = req.user as User;
      const { id_usuario } = req.params;
      const isAdmin = user?.roles?.some(rol => rol.nombre === 'admin');
      const isSelf = user?.id_usuario === id_usuario;

      if (!isAdmin && !isSelf) {
        throw new PermissionError('No tienes permisos para modificar este usuario.');
      }
    }
  }, async (req, res) => {
    const { id_usuario } = req.params;
    const { nombres } = req.body;

    const oldUser = await UserRepository.getUserById(id_usuario);
    if (!oldUser) throw new NotFoundError();

    await UserRepository.updateUser(id_usuario, { nombres });
    res.status(204).send();
  })

  fastify.delete('/usuarios/:id_usuario', {
    schema: {
      summary: 'Elimina un usuario por su ID',
      description: 'Elimina un usuario de la base de datos. Solo disponible para administradores.',
      tags: ['usuarios'],
      params: Type.Pick(User, ["id_usuario"]),
      response: {
        204: {
          description: 'Usuario eliminado'
        },
        403: Type.Object({ message: Type.String() })
      },
      security: [
        { bearerAuth: [] }
      ]
    },
    onRequest: async (req, res) => {
      fastify.authenticate(req, res);

      const user = req.user as User;
      if (!user || !user.roles || !user.roles.some(rol => rol.nombre === 'admin')) {
        throw new PermissionError('No tienes permisos para eliminar usuarios.');
      }
    }
  }, async (req, res) => {
    const { id_usuario } = req.params;
    if (! await UserRepository.deleteUser(id_usuario)) {
      throw new NotFoundError();
    }
    res.status(204).send();
  })
}

export default userRoutes