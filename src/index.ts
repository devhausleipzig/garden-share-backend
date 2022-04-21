import { Prisma, PrismaClient } from '@prisma/client'
import { fastify, FastifyInstance, RouteOptions } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import fastifySwagger from 'fastify-swagger'

const prisma = new PrismaClient()
const app = fastify({ logger: true })

// write utility for gathering tags from "component" folders
const tags: Array<{ name: string, description: string}> = [];

app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: '/docs',
    swagger: {
        info: { title: 'fastify-api', version: '0.1.0' },
    },
})

// write utility for gathering routes from "component" folders
const routes: Array<(fastify: FastifyInstance, options: RouteOptions) => void> = [];
routes.forEach( (route) => {
    app.register(route)
} )


const CreatePostModel = Type.Object({
    title: Type.String(),
    content: Type.String()
})

const CreateUserModel = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    posts: Type.Array(CreatePostModel)
})

app.get('/', {}, async (request, reply) => reply.send('hello'))

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
        process.exit(1)
    }
}
start()
