'use strict';

module.exports = (config, { strapi }) => {
  
  return async (ctx, next) => {
    const requestedUserId = ctx.params?.id;
    const currentUserId = ctx.state?.user?.id;
    const currentUserRoleId = ctx.state?.user?.role.id;

    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }

    sanitizeRequestBody(ctx, currentUserRoleId, currentUserId, requestedUserId);

    await next();
  };

  function sanitizeRequestBody(ctx, currentUserRoleId, currentUserId, requestedUserId) {
    if (currentUserRoleId == 3) {
      const { password, ...newData } = ctx.request.body;
      ctx.request.body = newData;
    } else if (currentUserRoleId == 6 && Number(currentUserId) == Number(requestedUserId)) {
      const { role, bloqueado, ...newData } = ctx.request.body;
      ctx.request.body = newData;
    } else {
      return ctx.throw(403, 'You are not allowed to update this user\'s information');
    }
  }
};
