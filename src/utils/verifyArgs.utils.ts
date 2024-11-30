import {FastifyRequest} from "fastify";

function verifyArgsUtils(args: string[], request: FastifyRequest, isBodyCheck?: boolean): boolean {
    const verifyArray = isBodyCheck ? request.body : request.query;

    for (const arg of args) {
        // @ts-ignore
        if (!verifyArray[arg]) {
            return false;
        }
    }
    return true;
}


export default {verifyArgsUtils};