'use strict';

module.exports = (config, { strapi }) => {
  
  return async (ctx, next) => {
    const currentUserId = ctx.state?.user?.id;

    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }

    if (ctx.state.user.role.id != 3) {
      ctx.query = {
        ...ctx.query,
        filters: { id: currentUserId },
      };
    }

    await next();
  };
};
