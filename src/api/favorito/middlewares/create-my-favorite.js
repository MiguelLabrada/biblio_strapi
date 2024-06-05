'use strict';

module.exports = (config, { strapi }) => {

    const checkInitialConditions = (ctx, libroId, usuarioId) => {
        const currentUserId = ctx.state.user.id;

        if (!currentUserId) {
            return ctx.unauthorized("You are not authorized to perform this action.");
        }
    
        if (!libroId) {
            return ctx.throw(400, "Book id must be provided.");
        }
    
        if (!usuarioId) {
            return ctx.throw(400, "User id must be provided.");
        }
    
        if (Number(currentUserId) !== Number(usuarioId)) {
            return ctx.throw(403, 'You are not allowed to create a favorite book selection for this user.');
        }
    };

    const checkIfFavoriteExists = async (ctx, strapi, libroId, usuarioId) => {
        const favorito = await strapi.service("api::favorito.favorito").find({
            filters: { 
                usuario: {
                    id: usuarioId
                },
                libro: {
                    id: libroId
                }
            }
        });
    
        if(favorito.results.length > 0){
            return ctx.throw(409, "A user favorite selection already exists for the book.");
        }
    };

    return async (ctx, next) => {
        const { libro, usuario } = ctx.request.body.data;

        checkInitialConditions(ctx, libro, usuario);

        await checkIfFavoriteExists(ctx, strapi, libro, usuario);

        await next();
    };
};
