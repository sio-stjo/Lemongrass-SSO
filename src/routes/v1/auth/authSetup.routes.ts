import {FastifyReply, FastifyRequest} from "fastify";
import responseHandlerHandler from "../../../middlewares/responseHandler.handler";

import verifyArgsUtils from "../../../utils/verifyArgs.utils";
import authSetupUtils from "../../../utils/routesUtils/authSetup.utils";
import AuthSessionUtils from "../../../utils/routesUtils/authSession.utils";

import bcrypt from 'bcrypt';
import {createHash} from "node:crypto";

class AuthSetup {
    public ROUTE_PREFIX = '/auth/setup';

    public async get(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['token'];
        const parsedQuery = request.query as Record<string, string>;

        if (!verifyArgsUtils.verifyArgsUtils(argsQuery, request)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Missing required arguments');
        }

        if (parsedQuery.token.length < 20) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        const userData = await authSetupUtils.getUserByStartupToken(parsedQuery.token);
        if (!userData) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        responseHandlerHandler.handleSuccessMessage(response, 'setup', {});
    }

    public async patch(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['token', 'email', 'password'];
        const parsedQuery = request.query as Record<string, string>;

        if (!verifyArgsUtils.verifyArgsUtils(argsQuery, request)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Missing required arguments');
        }

        if (parsedQuery.token.length < 20) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsedQuery.email)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid email');
        }

        let passwordHash;
        let emailHash;
        try {
            passwordHash = await bcrypt.hash(parsedQuery.password, 10);
            emailHash = createHash('sha256').update(parsedQuery.email).digest('hex');
        }catch {
            return responseHandlerHandler.handleErrorResponse(response, 'Internal error when registering user');
        }

        await authSetupUtils.registerUser(parsedQuery.token, parsedQuery.email, passwordHash, emailHash);

        responseHandlerHandler.handleSuccessMessage(response, 'User registered', {});
    }

    public async put(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['token', 'name', 'classID'];
        const parsedQuery = request.query as Record<string, string>;

        if (!verifyArgsUtils.verifyArgsUtils(argsQuery, request)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Missing required arguments');
        }

        const userData = await AuthSessionUtils.getUserByToken(parsedQuery.token);

        if (!userData || !userData.autorisations) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        if (!userData.autorisations.includes('lemongrass.cupcake.admin')) {
            return responseHandlerHandler.handleErrorResponse(response, 'Unauthorized');
        }

        await authSetupUtils.createNewAccount(parsedQuery.name, parsedQuery.classID);

        responseHandlerHandler.handleSuccessMessage(response, 'User registered', {});
    }
}

export default new AuthSetup();