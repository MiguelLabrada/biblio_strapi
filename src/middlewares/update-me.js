'use strict';
const _ = require("lodash");

/**
 * `update-me` middleware
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    if (!ctx.state?.user) {
        strapi.log.error("You are not authenticated.");
        return ctx.badRequest("You are not authenticated.");
    }

    const requestedUserId = ctx.params?.id;
    const currentUserId = ctx.state?.user?.id;
    const currentUserRoleId = ctx.state?.user?.role.id;

    if (currentUserRoleId == 3) {
      ctx.request.body = _.pick(ctx.request.body, [
        "username",
        "email",
        "password",
        "role",
        "dni",
        "nombre",
        "telefono",
        "domicilio",
        "bloqueado",
      ]);
    } else if (Number(currentUserId) !== Number(requestedUserId)) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    } else {
      ctx.request.body = _.pick(ctx.request.body, [
        "username",
        "email",
        "password",
        "dni",
        "nombre",
        "telefono",
        "domicilio",
      ]);
    }

    await next();
  };
};
