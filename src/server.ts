import Fastify from 'fastify'
import autoload from '@fastify/autoload'
import type { FastifyInstance, FastifyListenOptions } from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastifyListenOptions: FastifyListenOptions = {
  port: parseInt(process.env.FASTIFY_PORT || '3000'),
  host: process.env.FASTIFY_HOST || '0.0.0.0',
}

const fastify: FastifyInstance = Fastify();
fastify.register(autoload, {
  dir: path.join(__dirname, 'plugins'),
  dirNameRoutePrefix: false,
})

fastify.register(autoload, {
  dir: path.join(__dirname, 'routes'),
  dirNameRoutePrefix: false,
})

fastify.listen(fastifyListenOptions, (err: any) => {
  if (err) {
    fastify.close()
    process.exit(1)
  }
})