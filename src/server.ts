import { Prisma, PrismaClient } from '@prisma/client'
import { fastify, FastifyInstance, RouteOptions } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import fastifySwagger from 'fastify-swagger'

const prisma = new PrismaClient()
const app = fastify({ logger: true })

import { router, tags, models } from './router'

app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: '/docs',
    swagger: {
        info: { title: 'fastify-api', version: '0.1.0' },
        definitions: {} // need to figure out typing here for "models"
    }
})

app.register(router)

//@ts-ignore
definitions['CreatePostModel'] = CreatePostModel
//@ts-ignore
definitions['CreateUserModel'] = CreateUserModel

const TestParams = Type.Object({
    id: Type.Integer()
})

app.get<{ Params: Static<typeof TestParams> }>
(
    '/test/:id',
    {
        schema: {
            params: TestParams
        }
    },
    async (request, reply) => {
        reply.send('hello')
    }
)

app.post<{ Body: Static<typeof CreateUserModel> }>
(
    `/signup`,
    {
        schema: {
            body: CreateUserModel,
            response: {
                200: Type.String()
            }
        }
    },
    async (request, reply) => {
        const { name, email, posts } = request.body

        const postData = posts?.map((post: Prisma.PostCreateInput) => {
            return { title: post?.title, content: post?.content }
        })

        const result = await prisma.user.create({
            data: {
                name,
                email,
                posts: {
                    create: postData,
                },
            },
        })

        reply.send(result.id)
    }
)

app.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany()
    reply.send(users)
})

const start = async () => {
    try {
        await app.listen(8000, '0.0.0.0')
    } catch (err) {
        app.log.error(err)
    }
}
start()
