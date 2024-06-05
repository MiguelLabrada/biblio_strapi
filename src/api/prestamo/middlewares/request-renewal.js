'use strict';

/**
 * `request-renewal` middleware
 */

module.exports = (config, { strapi }) => {
    
  return async (ctx, next) => {
    const currentUserId = ctx.state.user.id;
    const currentUserRoleId = ctx.state?.user?.role.id;
    const requestedLoan = ctx.params?.id;

    const prestamo = await strapi.service("api::prestamo.prestamo").findOne(requestedLoan, {
        populate: ["usuario"]
    });
    
    
    if(currentUserRoleId == 3){
        const { ejemplar, usuario, ...newData } = ctx.request.body.data;
        ctx.request.body.data = newData;
    } else if (Number(currentUserId) !== Number(prestamo.usuario.id)) {
        return ctx.unauthorized("You are not authorized to perform this action.");
    } else {
        ctx.request.body.data.renovacion_solicitada = true;
        const { renovacion_solicitada } = ctx.request.body.data;
        ctx.request.body.data = { renovacion_solicitada };
    } 

    await next();
  };
};
