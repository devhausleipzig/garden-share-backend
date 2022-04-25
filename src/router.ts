import glob from 'glob'
import { fastify, FastifyInstance, RouteOptions } from 'fastify'
import { Static, TSchema } from '@sinclair/typebox'

const allRouters: Array<(fastify: FastifyInstance, options: RouteOptions) => void> = [];
const allTags: Array<{ name: string, description: string}> = [];
const allModels: Array<Static<TSchema>> = [];

glob.sync( './modules/**/routes.ts' ).forEach( (module) => {
    const { router, tags, models } = require(module)

    allTags.push(...tags)
    allModels.push(...models)
    allRouters.push(router)
});

export const tags = allTags;

export const models = {
    ...allModels
};

export const router = function (fastify: FastifyInstance, options: RouteOptions, done: () => void) {
    allRouters.forEach( (router) => {
        router(fastify, options);
    })
    done()
};