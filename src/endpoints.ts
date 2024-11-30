import {HTTPMethods, RouteHandlerMethod} from "fastify";
import PingRoutes from "./routes/v1/ping.routes";
import AuthSetupRoutes from "./routes/v1/auth/authSetup.routes";
import AuthSessionRoutes from "./routes/v1/auth/authSession.routes";
import AccountsRoutes from "./routes/v1/auth/admin/accounts.routes";
import ClassRoutes from "./routes/v1/auth/admin/class.routes";
import UserRoutes from "./routes/v1/auth/admin/user.routes";

interface customRoute {
    method: HTTPMethods;
    path: string,
    func: RouteHandlerMethod
}

interface serviceMethods {
    ROUTE_PREFIX: string;
    get?: RouteHandlerMethod;
    post?: RouteHandlerMethod;
    put?: RouteHandlerMethod;
    patch?: RouteHandlerMethod;
    delete?: RouteHandlerMethod;
    options?: RouteHandlerMethod;
}

const routes: customRoute[] = [];
function addEndPoint(service: serviceMethods) {
    if (service.get)
        routes.push({
            method: 'GET',
            path: service.ROUTE_PREFIX,
            func: service.get
        });
    if (service.post)
        routes.push({
            method: 'POST',
            path: service.ROUTE_PREFIX,
            func: service.post
        });
    if (service.put)
        routes.push({
            method: 'PUT',
            path: service.ROUTE_PREFIX,
            func: service.put
        });
    if (service.patch)
        routes.push({
            method: 'PATCH',
            path: service.ROUTE_PREFIX,
            func: service.patch
        });
    if (service.delete)
        routes.push({
            method: 'DELETE',
            path: service.ROUTE_PREFIX,
            func: service.delete
        });
    routes.push({
        method: 'OPTIONS',
        path: service.ROUTE_PREFIX,
        func: () => {}
    });
}

/* Default Endpoints */
addEndPoint(PingRoutes);

/* Auth Endpoints */
addEndPoint(AuthSetupRoutes);
addEndPoint(AuthSessionRoutes);

/* Admin Endpoints */
addEndPoint(AccountsRoutes);
addEndPoint(ClassRoutes);
addEndPoint(UserRoutes);

export default routes;