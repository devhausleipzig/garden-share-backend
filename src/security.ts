//@ts-nocheck

// third-party imports
import { FastifyInstance, RouteOptions } from "fastify";
import fastifyJwt from 'fastify-jwt';
import grant from 'grant';

// local imports
import { loadEnv } from './utils/env'
import { send401 } from "./utils/errors";

// const securityConfig = {
//     sessionSecret: loadEnv('SESSION_SECRET'),
//     appOrigin: loadEnv('APP_ORIGIN'),
//     github: {
//         client_id: loadEnv('GH_CLIENT_ID'),
//         client_secret: loadEnv('GH_CLIENT_SECRET'),
//     }
// };

export const security = function (
    fastify: FastifyInstance,
    options: RouteOptions,
    done: () => void
) {
    // make security config accessible within fastify instance
    // fastify.decorate('security', securityConfig);
    
    // fastify.register(
    //     grant.fastify()({
    //         defaults: {
    //             transport: 'session',
    //             origin: fastify.security.appOrigin,
    //         },
    //         github: {
    //             key: fastify.security.github.client_id,
    //             secret: fastify.security.github.client_secret,
    //             callback: '/',
    //             response: ['tokens', 'profile'],
    //             scope: ['user:email']
    //         }
    //     })
    // )

    done();
};