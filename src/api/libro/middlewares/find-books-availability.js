'use strict';

module.exports = (config, { strapi }) => {

  return async (ctx, next) => {
    await next();

    const currentUserRoleId = ctx.state?.user?.role.id;

    if (currentUserRoleId == 3 || currentUserRoleId == 6) {
      const data = ctx.response.body.data;
      for (const libro of data) {
        await getBookAvailability(strapi, libro);
      } 
    }   
  };

  async function getBookAvailability(strapi, libro) {
    const ejemplares = await getCopies(strapi, libro);
    let numEjemplares = ejemplares.results.length;
    for (const ejemplar of ejemplares.results) {
      numEjemplares = await getCopiesAvailability(strapi, ejemplar, numEjemplares);
    }
    libro.attributes.disponibilidad = numEjemplares;
  }
  
  async function getCopies(strapi, libro) {
    return await strapi.service("api::ejemplar.ejemplar").find({
      filters: {
        libro: {
          id: libro.id
        }
      }
    });
  }

  async function getCopiesAvailability(strapi, ejemplar, disponibilidad) {
    const prestamosActivos = await getActiveLoans(strapi, ejemplar);
    if (prestamosActivos.results.length > 0) {
      disponibilidad--;
    }
    return disponibilidad;
  }

  async function getActiveLoans(strapi, ejemplar) {
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
};
