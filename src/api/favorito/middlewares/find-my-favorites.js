'use strict';

module.exports = (config, { strapi }) => {
  
  return async (ctx, next) => {
    const currentUserId = ctx.state.user.id;
    
    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }

    ctx.query = {
      ...ctx.query,
      populate: ["libro"],
      filters: {
        usuario: {
          id: currentUserId
        }
      }
    };

    await next();
  };
};
