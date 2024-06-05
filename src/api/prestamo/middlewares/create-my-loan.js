'use strict';

module.exports = (config, { strapi }) => {

  return async (ctx, next) => {
    const currentUserId = ctx.state?.user?.id;
    const currentUserRoleId = ctx.state?.user?.role.id;

    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }

    completeRequestAccordingRole(ctx, currentUserRoleId, currentUserId);

    const loanLibroId = ctx.request.body.data.ejemplar;
    try {
      const ejemplarId = await getAvailableCopy(strapi, loanLibroId);
      ctx.request.body.data.ejemplar = ejemplarId;
    } catch (error) {
      return ctx.throw(409, error.message);
    }

    sanitizeRequestBody(ctx, currentUserRoleId);

    await next();
  };

  function completeRequestAccordingRole(ctx, currentUserRoleId, currentUserId) {
    const loanUserId = ctx.request.body.data.usuario;
    const now = new Date();
    const futureDate = new Date(now);

    if (currentUserRoleId == 3) {
      ctx.request.body.data.estado = "Prestado";
      futureDate.setDate(now.getDate() + 3 * 7);
      ctx.request.body.data.fecha_lim_reserva = now;
      ctx.request.body.data.fecha_prestamo = now;
      ctx.request.body.data.fecha_lim_prestamo = futureDate;
    } else if (currentUserRoleId == 6 && Number(currentUserId) == Number(loanUserId)) {
      ctx.request.body.data.estado = "Reservado";
      futureDate.setDate(now.getDate() + 3);
      ctx.request.body.data.fecha_lim_reserva = futureDate;
    } else {
      ctx.throw(403, 'You are not allowed to create a loan for this user.');
    }
  }

  async function getAvailableCopy(strapi, loanLibroId) {
    const ejemplares = await getCopies(strapi, loanLibroId);

    for (const ejemplar of ejemplares.results) {
      const prestamos = await getActiveLoansOfCopy(strapi, ejemplar);

      if (prestamos.results.length === 0) {
        return ejemplar.id;
      }
    }

    throw new Error("There are no copies available to reserve.");
  }

  async function getCopies(strapi, loanLibroId) {
    return await strapi.service("api::ejemplar.ejemplar").find({
      filters: {
        libro: {
          id: loanLibroId
        }
      }
    });
  }

  async function getActiveLoansOfCopy(strapi, ejemplar) {
    return await strapi.service("api::prestamo.prestamo").find({
      filters: {
        ejemplar: {
          id: ejemplar.id
        },
        $or: [
          { estado: 'Reservado' },
          { estado: 'Prestado' }
        ]
      }
    });
  }

  function sanitizeRequestBody(ctx, currentUserRoleId) {
    if (currentUserRoleId == 3) {
      const { fecha_devolucion, renovacion_solicitada, ...newData } = ctx.request.body;
      ctx.request.body = newData;
    } else {
      const { fecha_lim_reserva, fecha_prestamo, fecha_lim_prestamo, fecha_devolucion, renovacion_solicitada, ...newData } = ctx.request.body;
      ctx.request.body = newData;
    }
  }
};
