'use strict';

/**
 * `create-my-favorite` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const currentUserId = ctx.state.user.id;
    const userWhoMarks = ctx.request.body.data.usuario;

    if (Number(currentUserId) !== Number(userWhoMarks)) {
        return ctx.unauthorized("You are not authorized to perform this action.");
    }

    const favorito = await strapi.service("api::favorito.favorito").find({
        filters: { 
            usuario: {
                id: currentUserId
            },
            libro: {
                id: ctx.request.body.data.libro
            }
        }
    });

    if(favorito.results.length > 0){
        return ctx.unauthorized("A user favorite selection already exists for the book.");
    }

    await next();
  };
};
