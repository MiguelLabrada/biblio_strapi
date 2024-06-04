'use strict';

/**
 * `delete-my-favorite` middleware
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const currentUserId = ctx.state.user.id;
    const requestedFavorite = ctx.params?.id;

    const favorito = await strapi.service("api::favorito.favorito").findOne(requestedFavorite, {
        populate: ["usuario"]
    });
    
    if (Number(currentUserId) !== Number(favorito.usuario.id)) {
        return ctx.unauthorized("You are not authorized to perform this action.");
    }

    await next();
  };
};
