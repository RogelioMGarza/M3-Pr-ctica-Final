const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Veterinaria",
      version: "1.0.0",
      description: "Documentación Swagger de la API de Citas",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer"
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // 👈 esto es clave
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
