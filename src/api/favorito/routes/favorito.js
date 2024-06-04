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
    },
});