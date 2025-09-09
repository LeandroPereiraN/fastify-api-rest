import fastifyPlugin from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { User } from '../types/User'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthorizedError } from '../models/errors'

export default fastifyPlugin(async (fastify, opts) => {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
  })

  fastify.decorate("authenticate", async function (req: FastifyRequest, res: FastifyReply) {
    try {
      await req.jwtVerify();
    } catch (err) {
      throw new AuthorizedError();
    }
  })
})

declare module 'fastify' {
  interface FastifyJWT {
    user: User
    payload: User
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(req: FastifyRequest, res: FastifyReply): Promise<void>
  }
}
