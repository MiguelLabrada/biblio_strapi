'use strict';

/**
 * `create-my-loan` middleware
 */

module.exports = (config, { strapi }) => {
  
  return async (ctx, next) => {
    const currentUserId = ctx.state?.user?.id;
    const currentUserRoleId = ctx.state?.user?.role.id;
    const loanUserId = ctx.request.body.data.usuario;
    const now = new Date();
    const futureDate = new Date(now);

    if (currentUserRoleId == 3) {
      ctx.request.body.data.estado = "Prestado";
      futureDate.setDate(now.getDate() + 3 * 7);
      ctx.request.body.data.fecha_lim_reserva = now;
      ctx.request.body.data.fecha_prestamo = now;
      ctx.request.body.data.fecha_lim_prestamo = futureDate;
    } else if (Number(currentUserId) !== Number(loanUserId)) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    } else {
      ctx.request.body.data.estado = "Reservado";
      futureDate.setDate(now.getDate() + 3);
      ctx.request.body.data.fecha_lim_reserva = futureDate;
    }

    const loanLibroId = ctx.request.body.data.ejemplar;
    let ejemplarId = 0;
    const ejemplares = await strapi.service("api::ejemplar.ejemplar").find({
      filters: {
        libro: {
            id: loanLibroId
        }
      }
    });
    if (ejemplares.results.length > 0) {
      for (let ejemplar = 0; ejemplar < ejemplares.results.length; ejemplar++) {
        const prestamos = await strapi.service("api::prestamo.prestamo").find({
          filters: {
            ejemplar: {
                id: ejemplares.results[ejemplar].id
            },
            $or: [
              { estado: 'Reservado' },
              { estado: 'Prestado' }
            ]
          }
        });
        if (prestamos.results.length == 0) {
          ejemplarId = ejemplares.results[ejemplar].id;
          break;
        }
      }
    }
    if (ejemplarId == 0) {
      return ctx.unauthorized("There are no copies available to reserve.");
    }
    ctx.request.body.data.ejemplar = ejemplarId;

    await next();
  };
};
