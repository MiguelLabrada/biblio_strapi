module.exports = ({ env }) => ({
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
    email: {
      config: {
        provider: 'strapi-provider-email-smtp',
        providerOptions: {
          host: 'smtp.gmail.com', //SMTP Host
          port: 465   , //SMTP Port
          secure: true,
          username: 'diegocervera24@gmail.com',
          password: 'hadc aceq gczy aimw',
          rejectUnauthorized: true,
          requireTLS: true,
          connectionTimeout: 1,
        },
      },
      settings: {
        defaultFrom: 'diegocervera24@gmail.com',
        defaultReplyTo: 'diegocervera24@gmail.com',
      }, 
    },    
  });