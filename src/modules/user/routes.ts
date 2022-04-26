// third-party imports
import { FastifyInstance, RouteOptions } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

// local imports
import { prisma } from '../base.models'
import { CreateUserModel } from './models'
import { send500 } from '../../utils/errors'

module.exports = function (app: FastifyInstance, opts: RouteOptions) {

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
            const result = await prisma.user.create({
                data: {
                    ...request.body
                },
            })
    
            reply.send(result.identifier)
        }
    )
    
    app.get(
        "/users",
        async (request, reply) => {
            try {
                const users = await prisma.user.findMany();
                reply.status(200).send(users);
            } catch (err) {
                send500(reply);
            }
        }
    );

    app.get<{ Params: { id: string } }>(
        "/users/:id",
        {
            schema: {
                params: {
                    id: Type.String({ format: "uuid" }),
                }
            }
        },
        async (request, reply) => {
            const { id } = request.params;
    
            try {
                const user = await prisma.user.findUnique({
                    where: { identifier: id },
            });
                reply.send(user);
            } catch (err) {
                send500(reply);
            }
        }
    );

}



