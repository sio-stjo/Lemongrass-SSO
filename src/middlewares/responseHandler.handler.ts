import {FastifyReply} from "fastify";

// This is the template for the response, purpose is to make the response consistent
const FORMATED_TEMPLATE = {
    status: false,
    message: '',
    data: null
}

// This class is used to handle the response of the server
class middlewareResponseHandler {
    handleErrorResponse(response: FastifyReply, messageResponse: string, dataResponse?: any) {
        const message = FORMATED_TEMPLATE;
        message.status = false;
        message.message = messageResponse;
        message.data = dataResponse || null;

        response.code(400).send(message);
    }
    handleSuccessMessage(response: FastifyReply, messageResponse: string, dataResponse?: any) {
        const message = FORMATED_TEMPLATE;
        message.status = true;
        message.message = messageResponse;
        message.data = dataResponse || null;

        response.code(200).send(message);
    }
    unknownRoutes(response: FastifyReply) {
        const message = FORMATED_TEMPLATE;
        message.status = false;
        message.message = 'Unknown routes';
        message.data = null;

        response.code(404).send(message);
    }
}

export default new middlewareResponseHandler();