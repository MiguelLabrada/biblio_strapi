'use strict';

module.exports = (config, { strapi }) => {

  return async (ctx, next) => {
    const currentUserId = ctx.state.user.id;
    const requestedFavorite = ctx.params?.id;

    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }

    const favorito = await strapi.service("api::favorito.favorito").findOne(
      requestedFavorite, 
      { populate: ["usuario"] }
    );
    
    if (Number(currentUserId) !== Number(favorito.usuario.id)) {
      return ctx.throw(403, 'You are not allowed to delete a favorite book selection for this user.');
    }

    await next();
  };
};
