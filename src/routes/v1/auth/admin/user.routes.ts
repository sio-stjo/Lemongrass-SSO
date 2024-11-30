import {FastifyReply, FastifyRequest} from "fastify";
import responseHandlerHandler from "../../../../middlewares/responseHandler.handler";

import verifyArgsUtils from "../../../../utils/verifyArgs.utils";
import AuthSessionUtils from "../../../../utils/routesUtils/authSession.utils";
import authSessionUtils from "../../../../utils/routesUtils/authSession.utils";

class AuthAccountSetup {
    public ROUTE_PREFIX = '/admin/user';

    public async get(request: FastifyRequest, response: FastifyReply) {
        const argsQuery = ['token', 'userID'];
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

        const userInfos = await authSessionUtils.getUserInfos(parsedQuery.userID);

        responseHandlerHandler.handleSuccessMessage(response, 'Method Allowed', userInfos);
    }
}

export default new AuthAccountSetup();