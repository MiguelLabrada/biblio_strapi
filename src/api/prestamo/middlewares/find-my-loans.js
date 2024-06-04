'use strict';

/**
 * `find-my-loans` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const currentUserId = ctx.state?.user?.id;

    if (!currentUserId) {
      strapi.log.error("You are not authenticated.");
      return ctx.badRequest("You are not authenticated.");
    }

    if (ctx.state.user.role.id != 3) {
      ctx.query = {
        ...ctx.query,
        filters: { usuario: currentUserId },
      };
    }

    await next();
  };
};
