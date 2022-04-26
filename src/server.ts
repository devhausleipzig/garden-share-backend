import { fastify } from "fastify";
import fastifySwagger from "fastify-swagger";

const app = fastify({ logger: true });

import { router, tags, models } from './router'

app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: '/docs',
    swagger: {
        info: { title: 'fastify-api', version: '0.1.0' },
        tags,
        definitions: {} // need to figure out typing here for "models"
    }
})

app.register(router)

const start = async () => {
    try {
        await app.listen(8000, '0.0.0.0')
    } catch (err) {
        app.log.error(err)
    }
}
start()
