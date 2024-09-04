'use strict';

module.exports = (config, { strapi }) => {

  const removePortadaData = (libro) => {
    const portadaUrl = libro.attributes.portada.data.attributes.url;
    libro.attributes.portada = portadaUrl;
  };

  return async (ctx, next) => {
    ctx.query.populate = '*';
    await next();

    const data = ctx.response.body.data;
    if (Array.isArray(data)) {
      for (const libro of data) {
        removePortadaData(libro);
        await getBookAvailability(strapi, libro);
      }
    } else if (typeof data === 'object' && data !== null) {
      removePortadaData(data);
      await getBookAvailability(strapi, data);
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
