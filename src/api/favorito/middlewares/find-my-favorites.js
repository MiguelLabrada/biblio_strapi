'use strict';

/**
 * `find-my-favorites` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const userId = ctx.state.user.id;
    
    if (!userId) {
      strapi.log.error("You are not authenticated.");
      return ctx.badRequest("You are not authenticated.");
    }

    ctx.query = {
      ...ctx.query,
      populate: ["libro"],
      filters: {
        usuario: {
          id: userId
        }
      }
    };

    await next();
  };
};
