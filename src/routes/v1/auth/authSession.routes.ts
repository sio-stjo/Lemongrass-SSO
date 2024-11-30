import {FastifyReply, FastifyRequest} from "fastify";
import responseHandlerHandler from "../../../middlewares/responseHandler.handler";

import verifyArgsUtils from "../../../utils/verifyArgs.utils";
import AuthSessionUtils from "../../../utils/routesUtils/authSession.utils";

import {createHash} from "node:crypto";

class AuthSession {
    public ROUTE_PREFIX = '/auth/session';

    public async get(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['token', 'extra'];
        const parsedQuery = request.query as Record<string, string>;

        if (!verifyArgsUtils.verifyArgsUtils(argsQuery, request)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Missing required arguments');
        }

        if (parsedQuery.token.length < 20) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        const userData = await AuthSessionUtils.getUserByToken(parsedQuery.token, parsedQuery.extra);
        if (!userData) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        responseHandlerHandler.handleSuccessMessage(response, 'User found', userData);
    }

    public async post(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['email', 'password'];
        // @ts-ignore
        const parsedQuery = request.body as Record<string, string>;

        if (!request.body || !verifyArgsUtils.verifyArgsUtils(argsQuery, request, true)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Missing required arguments');
        }

        const email_hash = createHash('sha256').update(parsedQuery.email).digest('hex');
        const [isValidAuth, IDUser] = await AuthSessionUtils.checkUserPassword(email_hash, parsedQuery.password);

        if (!isValidAuth) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid credentials');
        }

        const accessTokens = await AuthSessionUtils.generateAccessToken(IDUser);
        responseHandlerHandler.handleSuccessMessage(response, 'User logged in', accessTokens);
    }

    public async patch(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['access_token', 'refresh_token', 'expires_in'];
        const parsedQuery = request.query as Record<string, string>;

        if (!verifyArgsUtils.verifyArgsUtils(argsQuery, request)) {
            return responseHandlerHandler.handleErrorResponse(response, 'Missing required arguments');
        }

        const refreshTokenValidity = await AuthSessionUtils.verifyRefreshToken(parsedQuery.access_token, parsedQuery.refresh_token, parsedQuery.expires_in);

        if (!refreshTokenValidity) {
            return responseHandlerHandler.handleErrorResponse(response, 'Invalid token');
        }

        const accessTokens = await AuthSessionUtils.generateAccessToken(refreshTokenValidity.IDUser);
        responseHandlerHandler.handleSuccessMessage(response, 'Token renewed', accessTokens);
    }
}

export default new AuthSession();