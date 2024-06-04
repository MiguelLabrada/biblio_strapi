'use strict';

/**
 * favorito router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::favorito.favorito', {
    config: {
        find: {
            middlewares: ['api::favorito.find-my-favorites'],
        },
        create: {
            middlewares: ['api::favorito.create-my-favorite'],
        },
        delete: {
            middlewares: ['api::favorito.delete-my-favorite'],
        }
    },
});