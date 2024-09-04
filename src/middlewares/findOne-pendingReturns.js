'use strict';

module.exports = (config, { strapi }) => {
  
  return async (ctx, next) => {
    if (!ctx.state.user.id) {
        return ctx.unauthorized("You are not authorized to perform this action.");
    }

    if (ctx.state.user.role.id == 3) {
        const requestedUser = ctx.params?.id;
        const currentDate = new Date();
        const prestamos = await strapi.service("api::prestamo.prestamo").find({
            filters: {
                usuario: {
                    id: requestedUser
                },
                estado: "Prestado",
                fecha_lim_prestamo: {
                    $lt: currentDate
                }
            }
        });

        await next();

        ctx.response.body = {
            ...ctx.response.body,
            prestamos_pendientes: prestamos.results.length
        };
    } else{
        await next();
    }
  };
};
