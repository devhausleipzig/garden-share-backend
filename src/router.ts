// stlib imports
import path from 'path'

// third-party imports
import glob from 'glob'
import { FastifyInstance, RouteOptions } from 'fastify'
import { Static, TSchema } from '@sinclair/typebox'

const allRouters: Array<(fastify: FastifyInstance, options: RouteOptions) => void> = [];
const allTags: Array<{ name: string, description: string}> = [];
const allModels: Array<Static<TSchema>> = [];

glob.sync( '**/routes.ts' ).forEach( (modulePath) => {
    const module = path.parse(modulePath)
    module.dir = module.dir.split('/').filter( (fragment) => {
        return fragment != 'src'
    }).join('/')

    const { router, tags, models } = require(`./${module.dir}/${module.name}`)

    if(router){
        allRouters.push(router)
    } else {
        console.log(`No router defined in ${module.dir}`)
    }

    if(tags){
        allTags.push(...tags)
    } else {
        console.log(`No tags defined in ${module.dir}`)
    }

    if(models){
        allModels.push(...models)
    } else {
        console.log(`No models defined in ${module.dir}`)
    }
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