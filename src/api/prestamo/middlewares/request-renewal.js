'use strict';

module.exports = (config, { strapi }) => {
    
  return async (ctx, next) => {
    const currentUserId = ctx.state.user.id;
    const currentUserRoleId = ctx.state?.user?.role.id;

    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }
    
    sanitizeRequestBody(ctx, currentUserRoleId, currentUserId);

    await next();
  };

  async function sanitizeRequestBody(ctx, currentUserRoleId, currentUserId) {
    if(currentUserRoleId == 3){
      const { ejemplar, usuario, ...newData } = ctx.request.body.data;
      ctx.request.body.data = newData;
    } else if (currentUserRoleId == 6) {
      const requestedLoan = ctx.params?.id;
      const prestamo = await strapi.service("api::prestamo.prestamo").findOne(requestedLoan, {
        populate: ["usuario"]
      });
      if (Number(currentUserId) == Number(prestamo.usuario.id)) {
        ctx.request.body.data.renovacion_solicitada = true;
        const { renovacion_solicitada } = ctx.request.body.data;
        ctx.request.body.data = { renovacion_solicitada };
      }
    } else {
      return ctx.throw(403, 'You are not allowed to update a loan for this user.');
    }
  }
};
