import {FastifyReply, FastifyRequest} from "fastify";
import responseHandlerHandler from "../../middlewares/responseHandler.handler";

class PingRoutes {
    public ROUTE_PREFIX = '/ping';

    public get(request: FastifyRequest, response: FastifyReply) {
        responseHandlerHandler.handleSuccessMessage(response, 'pong', {});
    }
}

export default new PingRoutes();