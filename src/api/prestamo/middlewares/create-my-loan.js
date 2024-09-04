'use strict';

module.exports = (config, { strapi }) => {

  return async (ctx, next) => {
    const currentUserId = ctx.state?.user?.id;
    const currentUserRoleId = ctx.state?.user?.role.id;

    if (!currentUserId) {
      return ctx.unauthorized("You are not authorized to perform this action.");
    }
    
    const loanUsername = ctx.request.body.data.usuario;
    const usuarios = await getUserId(strapi, loanUsername);

    if(usuarios.length == 0){
      return ctx.throw(404, 'User not found.');
    }

    completeRequestAccordingRole(ctx, currentUserRoleId, currentUserId, usuarios[0].id);

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

  async function getUserId(strapi, loanUsername) {
    return await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
          filters: { username: loanUsername },
      }
    );
  }

  function completeRequestAccordingRole(ctx, currentUserRoleId, currentUserId, userId) {
    const now = new Date();
    const futureDate = new Date(now);

    ctx.request.body.data.usuario = userId;
    if (currentUserRoleId == 3) {
      ctx.request.body.data.estado = "Prestado";
      futureDate.setDate(now.getDate() + 3 * 7);
      ctx.request.body.data.fecha_lim_reserva = now;
      ctx.request.body.data.fecha_prestamo = now;
      ctx.request.body.data.fecha_lim_prestamo = futureDate;
    } else if (currentUserRoleId == 6 && Number(currentUserId) == Number(userId)) {
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
