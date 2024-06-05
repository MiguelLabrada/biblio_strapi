'use strict';

/**
 * libro router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::libro.libro', {
    config: {
        find: {
            middlewares: ['api::libro.find-books-availability'],
        },
    },
});
