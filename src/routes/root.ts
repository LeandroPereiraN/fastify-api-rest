import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const rootRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get('/', {
        schema: {
            tags: ["root"],
            summary: "Obtiene un token JWT",
            description: "Autentica usuario y contraseña, devuelve un token JWT si es correcto",
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ping: { type: 'string' }
                    }
                }
            }
        },
    }, async (req, res) => {
        return { ping: 'ok' };
    });
}

export default rootRoutes;