// stlib imports
import path from "path";
import type { OpenAPIV2 } from "openapi-types";

// third-party imports
import glob from "glob";
import { FastifyInstance, RouteOptions } from "fastify";

const allRouters: Array<
  (fastify: FastifyInstance, options: RouteOptions) => void
> = [];
const allTags: Array<{ name: string; description: string }> = [];
let allModels: OpenAPIV2.DefinitionsObject = {};

glob.sync("./**/routes.ts").forEach((modulePath) => {
  const module = path.parse(modulePath);
  module.dir = module.dir
    .split("/")
    .filter((fragment) => {
      return fragment != "src";
    })
    .join("/");

  const { router, tags, models } = require(`./${module.dir}/${module.name}`);

  if (router) {
    allRouters.push(router);
  } else {
    console.log(`No router exported in ${module.dir}`);
  }

  if (tags) {
    allTags.push(...tags);
  } else {
    console.log(`No tags exported in ${module.dir}`);
  }

  if (models) {
    allModels = { ...allModels, ...models };
  } else {
    console.log(`No models exported in ${module.dir}`);
  }
});

export const tags = allTags;

export const models = {
  ...allModels,
};

export const router = function (
  fastify: FastifyInstance,
  options: RouteOptions,
  done: () => void
) {
  allRouters.forEach((router) => {
    router(fastify, options);
  });
  done();
};
