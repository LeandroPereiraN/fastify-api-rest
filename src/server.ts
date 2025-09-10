import Fastify from 'fastify'
import swagger from './plugins/swagger.ts'
import type { FastifyInstance, FastifyListenOptions } from 'fastify'
import userRoutes from './routes/users/user-routes.ts'
import authRoutes from './routes/auth/auth-routes.ts'
import jwt from './plugins/jwt.ts'

const fastifyListenOptions: FastifyListenOptions = {
  port: parseInt(process.env.FASTIFY_PORT || '3000'),
  host: process.env.FASTIFY_HOST || '0.0.0.0',
}

const fastify: FastifyInstance = Fastify();

await fastify.register(swagger)
await fastify.register(jwt)
await fastify.register(userRoutes)
await fastify.register(authRoutes)

fastify.listen(fastifyListenOptions, (err: any) => {
  if (err) {
    fastify.close()
    process.exit(1)
  }
})