/*
*   LemonGrass - SSO
*   Description: Entry point of the application
*   Author:  Paul DESPLANQUES & Adélaide HUMEZ
*   Stack: Node.js Fastify Typescript && Mysql Knex
*/

import {configDotenv} from "dotenv";
import Fastify, { FastifyInstance } from 'fastify'

import fastifyEndpoints from "./endpoints";
import mysqlConnector from "./utils/mysql.connector";
import responseHandler from "./middlewares/responseHandler.handler";

let isProduction: boolean = false;
const server: FastifyInstance = Fastify({
    logger: true
});

// Entry point of the application
(async () => {
    configDotenv();
    await mysqlConnector.initConnection();

    isProduction = process.env.APP_VERSION === 'production';
    const port = isProduction? process.env.ENV_PROD_PORT : 3000;

    server.register(require('@fastify/formbody'));
    server.setNotFoundHandler((request, reply) => { // 404 custom handler
        responseHandler.unknownRoutes(reply);
    });

    server.setErrorHandler((error, request, reply) => { // 500 custom handler
        console.log(error);
        responseHandler.handleErrorResponse(reply, 'Internal server error');
    });

    server.register((app, _, done) => { // Register all endpoints
        fastifyEndpoints.forEach((endpoint) => {
            server.route({
                method: endpoint.method,
                url: endpoint.path,
                handler: endpoint.func
            })
        });
        done();
    });

    // @ts-ignore : Fastify listen method is not typed
    server.listen({ port: port, host: '0.0.0.0'})
})();

module.exports = {
    isProduction
}