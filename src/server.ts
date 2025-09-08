import Fastify from 'fastify'
import swagger from './plugins/swagger.ts'
import type { FastifyInstance, FastifyListenOptions } from 'fastify'

const fastifyListenOptions: FastifyListenOptions = {
  port: parseInt(process.env.FASTIFY_PORT || '3000'),
  host: process.env.FASTIFY_HOST || '0.0.0.0',
}

const fastify: FastifyInstance = Fastify();

fastify.register(swagger)

fastify.listen(fastifyListenOptions, (err: any) => {
  if (err) {
    fastify.close()
    process.exit(1)
  }
})