'use strict';

/**
 * prestamo router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::prestamo.prestamo', {
    config: {
        find: {
            middlewares: ['api::prestamo.find-my-loans'],
        },
        create: {
            middlewares: ['api::prestamo.create-my-loan'],
        },
    },
});
