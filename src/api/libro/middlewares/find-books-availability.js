'use strict';

/**
 * `find-books-availability` middleware
 */

module.exports = (config, { strapi }) => {
  
  return async (ctx, next) => {
    await next();

    const currentUserRoleId = ctx.state?.user?.role.id;

    if (currentUserRoleId == 3 || currentUserRoleId == 6) {
      const data = ctx.response.body.data;
      for (let libro = 0; libro < data.length; libro++) {
        const ejemplares = await strapi.service("api::ejemplar.ejemplar").find({
          filters: {
              libro: {
                  id: data[libro].id
              }
          }
        });
        let disponibilidad = ejemplares.results.length;
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
            if (prestamos.results.length > 0) {
              disponibilidad--;
            }
          }
        }
        data[libro].attributes.disponibilidad = disponibilidad;
      } 
    }   
  };
};
