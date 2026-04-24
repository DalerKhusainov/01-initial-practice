import http from "http";
import { sendJSON } from "./utils/json";
import { logger } from "./utils/helpers";

export function createServer(): http.Server {
  return http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      logger(req, () => {
        const { url, method } = req;
        if (url === "/" && method === "GET") {
          sendJSON(res, 200, { message: "Home" });
        } else {
          sendJSON(res, 400, { message: "Invalid route" });
        }
      });
    }
  );
}
