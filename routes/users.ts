import http from "http";
import { userController } from "../controller/userController";
import { getIdFromUrl } from "../utils/url";
import { sendJSON } from "../utils/json";

export async function handleUsersRoute(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const method = req.method || "GET";
  const id = getIdFromUrl(req.url);

  switch (method) {
    case "GET":
      if (id !== null) {
        userController.getById(res, id);
      } else userController.getAll(res);
      break;

    case "POST":
      if (id !== null) {
        sendJSON(res, 400, {
          error: "POST request should not contain id parameter",
        });
      } else await userController.create(req, res);
      break;

    case "PUT":
      if (id !== null) {
        await userController.update(req, res, id);
      } else sendJSON(res, 400, { error: "PUT request requires id parameter" });
      break;

    case "DELETE":
      if (id !== null) {
        userController.delete(res, id);
      } else
        sendJSON(res, 400, { error: "DELETE request requires id parameter" });
      break;

    default:
      sendJSON(res, 405, { error: "Method not allowed for this route" });
  }
}
