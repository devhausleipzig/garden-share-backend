import { Static } from '@sinclair/typebox'
import { CreateUserModel } from './models'

module.exports = function (app, opts) {

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

}